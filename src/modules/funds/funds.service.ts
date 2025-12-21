import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'

import { Fund } from './entity/fund.entity'
import { FundMember } from './entity/fund-member.entity'
import { FundJoinRequest, JoinRequestStatus } from './entity/fund-join-request.entity'
import { CreateFundDto } from './dto/create-fund.dto'
import { UpdateFundDto } from './dto/update-fund.dto'
import { FundMemberRole } from './enums/fund-member-role.enum'
import { CategoriesService } from '../categories/categories.service'
import { UsersService } from '../users/users.service'

@Injectable()
export class FundsService {
  constructor(
    @InjectRepository(Fund)
    private readonly fundRepository: Repository<Fund>,
    @InjectRepository(FundMember)
    private readonly memberRepository: Repository<FundMember>,
    @InjectRepository(FundJoinRequest)
    private readonly joinRequestRepository: Repository<FundJoinRequest>,
    @Inject(forwardRef(() => CategoriesService))
    private readonly categoriesService: CategoriesService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Generates a unique 6-digit numberId for a fund
   * Format: 000000-999999 (padded with zeros)
   */
  private async generateNumberId(): Promise<string> {
    let numberId: string
    let exists = true
    let attempts = 0
    const maxAttempts = 10

    // Generate random 6-digit number (000000-999999), padded with zeros
    while (exists && attempts < maxAttempts) {
      const randomNum = Math.floor(Math.random() * 1000000) // 0-999999
      numberId = randomNum.toString().padStart(6, '0')
      const existing = await this.fundRepository.findOne({ where: { numberId } })
      exists = !!existing
      attempts++
    }

    if (exists) {
      throw new Error('Failed to generate unique numberId after multiple attempts')
    }

    return numberId!
  }

  async create(ownerId: string, dto: CreateFundDto): Promise<Fund> {
    const numberId = await this.generateNumberId()
    
    const fund = this.fundRepository.create({
      name: dto.name,
      type: dto.type,
      ownerId,
      numberId,
      description: dto.description ?? null,
    })

    const savedFund = await this.fundRepository.save(fund)

    const memberIds = Array.from(new Set([ownerId, ...(dto.memberIds ?? [])]))

    const members = memberIds.map((memberId) =>
      this.memberRepository.create({
        fundId: savedFund.id,
        userId: memberId,
        role: memberId === ownerId ? FundMemberRole.OWNER : FundMemberRole.MEMBER,
      }),
    )

    await this.memberRepository.save(members)

    // Initialize default categories for the fund
    await this.categoriesService.initializeDefaultCategoriesForFund(savedFund.id)

    return this.findByIdOrThrow(savedFund.id)
  }

  async update(fundId: string, actorId: string, dto: UpdateFundDto): Promise<Fund> {
    await this.assertOwner(fundId, actorId)
    await this.fundRepository.update({ id: fundId }, dto)
    return this.findByIdOrThrow(fundId)
  }

  async delete(fundId: string, actorId: string): Promise<void> {
    await this.assertOwner(fundId, actorId)
    await this.fundRepository.softDelete({ id: fundId })
  }

  async addMember(fundId: string, actorId: string, userId: string, role: FundMemberRole) {
    await this.assertOwner(fundId, actorId)

    const existing = await this.memberRepository.findOne({ where: { fundId, userId } })
    if (existing) {
      existing.role = role
      return this.memberRepository.save(existing)
    }

    const member = this.memberRepository.create({ fundId, userId, role })
    return this.memberRepository.save(member)
  }

  async removeMember(fundId: string, actorId: string, userId: string) {
    await this.assertOwner(fundId, actorId)

    if (actorId === userId) {
      throw new ForbiddenException('Owner cannot remove themselves')
    }

    await this.memberRepository.delete({ fundId, userId })
  }

  async getMembers(fundId: string, userId: string) {
    await this.assertMembership(fundId, userId)
    return this.memberRepository.find({ where: { fundId } })
  }

  async findAllForUser(userId: string) {
    const memberships = await this.memberRepository.find({ where: { userId } })
    if (memberships.length === 0) {
      return []
    }

    const fundIds = memberships.map((membership) => membership.fundId)
    return this.fundRepository.find({ where: { id: In(fundIds) } })
  }

  async findByIdOrThrow(fundId: string): Promise<Fund> {
    const fund = await this.fundRepository.findOne({ where: { id: fundId } })
    if (!fund) {
      throw new NotFoundException('Fund not found')
    }

    return fund
  }

  async assertMembership(fundId: string, userId: string): Promise<FundMember> {
    const membership = await this.memberRepository.findOne({ where: { fundId, userId } })
    if (!membership) {
      throw new ForbiddenException('You do not have access to this fund')
    }

    return membership
  }

  async assertOwner(fundId: string, userId: string): Promise<void> {
    const membership = await this.memberRepository.findOne({ where: { fundId, userId } })
    if (!membership || membership.role !== 'owner') {
      throw new ForbiddenException('Only owners can perform this action')
    }
  }

  /**
   * Find fund by numberId (for public search)
   */
  async findByNumberId(numberId: string): Promise<Fund> {
    const fund = await this.fundRepository.findOne({ where: { numberId } })
    if (!fund) {
      throw new NotFoundException('Fund not found')
    }
    return fund
  }

  /**
   * Get public fund information (minimal info for non-members)
   */
  async getPublicFundInfo(fundId: string) {
    const fund = await this.findByIdOrThrow(fundId)
    const owner = await this.usersService.findById(fund.ownerId)
    const memberCount = await this.memberRepository.count({ where: { fundId } })

    return {
      id: fund.id,
      name: fund.name,
      description: fund.description,
      owner: {
        id: owner.id,
        name: owner.name,
      },
      memberCount,
      numberId: fund.numberId,
    }
  }

  /**
   * Create a join request for a fund
   */
  async createJoinRequest(fundId: string, userId: string): Promise<FundJoinRequest> {
    // Check if fund exists
    const fund = await this.findByIdOrThrow(fundId)

    // Check if user is the owner
    if (fund.ownerId === userId) {
      throw new BadRequestException('You cannot request to join your own fund')
    }

    // Check if user is already a member
    const existingMember = await this.memberRepository.findOne({ where: { fundId, userId } })
    if (existingMember) {
      throw new BadRequestException('You are already a member of this fund')
    }

    // Check if there's already a pending join request
    const existingRequest = await this.joinRequestRepository.findOne({
      where: { fundId, userId, status: JoinRequestStatus.PENDING },
    })
    if (existingRequest) {
      throw new BadRequestException('You already have a pending join request for this fund')
    }

    // Create new join request
    const joinRequest = this.joinRequestRepository.create({
      fundId,
      userId,
      status: JoinRequestStatus.PENDING,
    })

    return this.joinRequestRepository.save(joinRequest)
  }
}
