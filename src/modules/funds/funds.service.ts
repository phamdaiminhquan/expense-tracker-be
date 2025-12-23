import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository, SelectQueryBuilder } from 'typeorm'

import { Fund } from './entity/fund.entity'
import { FundMember } from './entity/fund-member.entity'
import { FundJoinRequest, JoinRequestStatus } from './entity/fund-join-request.entity'
import { Message } from '../messages/message.entity'
import { CreateFundDto } from './dto/create-fund.dto'
import { UpdateFundDto } from './dto/update-fund.dto'
import { FundDto } from './dto/fund.dto'
import { FundLastMessageDto } from './dto/fund-last-message.dto'
import { PageOptionsDto } from '../../common/dto/page-options.dto'
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
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @Inject(forwardRef(() => CategoriesService))
    private readonly categoriesService: CategoriesService,
    private readonly usersService: UsersService,
  ) {}

  private async generateNumberId(): Promise<string> {
    let numberId: string
    let exists = true
    let attempts = 0
    const maxAttempts = 10

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

  async getMembers(fundId: string, userId: string) {
    await this.assertMembership(fundId, userId)
    return this.memberRepository.find({ where: { fundId } })
  }

  async updateFundLastMessage(fundId: string): Promise<void> {
    // Get the most recent message for this fund
    const lastMessage = await this.messageRepository.findOne({
      where: { fundId },
      order: { createdAt: 'DESC' },
    })

    // Update fund with lastMessage info (or null if no messages)
    await this.fundRepository.update(
      { id: fundId },
      {
        lastMessageId: lastMessage?.id || null,
        lastMessageTimestamp: lastMessage?.createdAt || null,
      },
    )
  }

  async findAllForUser(userId: string, pageOptions?: PageOptionsDto) {
    const memberships = await this.memberRepository.find({ where: { userId } })
    if (memberships.length === 0) return { data: [], total: 0 }

    const fundIds = memberships.map((membership) => membership.fundId)

    const allFunds = await this.fundRepository.find({
      where: { id: In(fundIds) },
      relations: ['lastMessage'],
    })

    const fundsWithActivity = allFunds.map((fund) => {
      const lastActivityTime = fund.lastMessageTimestamp 
        ? new Date(fund.lastMessageTimestamp) 
        : fund.updatedAt
      return {
        fund,
        lastActivityTime,
      }
    })

    // Apply sorting
    const orderDirection = pageOptions?.orderType === 'ASC' ? 'ASC' : 'DESC'
    const sortFn = (a: typeof fundsWithActivity[0], b: typeof fundsWithActivity[0]) => {
      const timeA = a.lastActivityTime.getTime()
      const timeB = b.lastActivityTime.getTime()
      return orderDirection === 'ASC' ? timeA - timeB : timeB - timeA
    }
    fundsWithActivity.sort(sortFn)

    // Get total before pagination
    const total = fundsWithActivity.length

    // Apply pagination
    const skip = pageOptions?.skip || 0
    const take = pageOptions?.take || 10
    const paginatedFunds = fundsWithActivity.slice(skip, skip + take)
    
    // Extract funds from sorted array
    const funds = paginatedFunds.map(item => item.fund)

    // Map to DTOs
    const fundDtos: FundDto[] = funds.map((fund) => {
      const lastMessageDto: FundLastMessageDto | null = fund.lastMessage
        ? {
            id: fund.lastMessage.id,
            message: fund.lastMessage.message,
            createdAt: fund.lastMessage.createdAt,
            processedAt: fund.lastMessage.processedAt || null,
          }
        : null

      return {
        id: fund.id,
        name: fund.name,
        type: fund.type,
        ownerId: fund.ownerId,
        numberId: fund.numberId,
        description: fund.description,
        createdAt: fund.createdAt,
        updatedAt: fund.updatedAt,
        lastMessage: lastMessageDto,
      }
    })

    return { data: fundDtos, total }
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
    if (!membership || membership.role !== FundMemberRole.OWNER) {
      throw new ForbiddenException('Only owners can perform this action')
    }
  }

  /**
   * Assert that user is either owner or admin
   */
  async assertAdminOrOwner(fundId: string, userId: string): Promise<FundMember> {
    const membership = await this.memberRepository.findOne({ where: { fundId, userId } })
    if (!membership) {
      throw new ForbiddenException('You do not have access to this fund')
    }
    if (membership.role !== FundMemberRole.OWNER && membership.role !== FundMemberRole.ADMIN) {
      throw new ForbiddenException('Only owners and admins can perform this action')
    }
    return membership
  }

  /**
   * Check if user can approve/reject join requests
   */
  async canApproveRequests(fundId: string, userId: string): Promise<boolean> {
    const membership = await this.memberRepository.findOne({ where: { fundId, userId } })
    return membership !== null && 
           (membership.role === FundMemberRole.OWNER || membership.role === FundMemberRole.ADMIN)
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
      // Return existing request instead of throwing error (idempotent)
      return existingRequest
    }

    // Check if there's an approved request (user might have been removed)
    const approvedRequest = await this.joinRequestRepository.findOne({
      where: { fundId, userId, status: JoinRequestStatus.APPROVED },
    })
    if (approvedRequest) {
      // If already approved but not a member (was removed), add them back
      const member = this.memberRepository.create({
        fundId,
        userId: userId,
        role: FundMemberRole.MEMBER,
      })
      await this.memberRepository.save(member)
      return approvedRequest
    }

    // Create new join request
    const joinRequest = this.joinRequestRepository.create({
      fundId,
      userId,
      status: JoinRequestStatus.PENDING,
    })

    return this.joinRequestRepository.save(joinRequest)
  }

  /**
   * Get join requests for a fund (with optional status filter)
   */
  async getJoinRequests(fundId: string, actorId: string, status?: JoinRequestStatus) {
    // Only owners and admins can view join requests
    await this.assertAdminOrOwner(fundId, actorId)

    const where: any = { fundId }
    if (status) {
      where.status = status
    }

    return this.joinRequestRepository.find({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    })
  }

  /**
   * Approve a join request
   */
  async approveJoinRequest(fundId: string, requestId: string, actorId: string): Promise<FundJoinRequest> {
    // Check permissions
    await this.assertAdminOrOwner(fundId, actorId)

    // Find the join request
    const joinRequest = await this.joinRequestRepository.findOne({
      where: { id: requestId, fundId },
      relations: ['user'],
    })

    if (!joinRequest) {
      throw new NotFoundException('Join request not found')
    }

    if (joinRequest.status !== JoinRequestStatus.PENDING) {
      throw new BadRequestException(`Cannot approve a request with status: ${joinRequest.status}`)
    }

    // Update request status
    joinRequest.status = JoinRequestStatus.APPROVED
    joinRequest.reviewedById = actorId
    joinRequest.reviewedAt = new Date()
    await this.joinRequestRepository.save(joinRequest)

    // Add user as member (default role: MEMBER)
    const existingMember = await this.memberRepository.findOne({
      where: { fundId, userId: joinRequest.userId },
    })

    if (!existingMember) {
      const member = this.memberRepository.create({
        fundId,
        userId: joinRequest.userId,
        role: FundMemberRole.MEMBER,
      })
      await this.memberRepository.save(member)
    } else {
      // If member exists but was removed, reactivate by updating role
      existingMember.role = FundMemberRole.MEMBER
      await this.memberRepository.save(existingMember)
    }

    return joinRequest
  }

  /**
   * Reject a join request
   */
  async rejectJoinRequest(fundId: string, requestId: string, actorId: string): Promise<FundJoinRequest> {
    // Check permissions
    await this.assertAdminOrOwner(fundId, actorId)

    // Find the join request
    const joinRequest = await this.joinRequestRepository.findOne({
      where: { id: requestId, fundId },
    })

    if (!joinRequest) {
      throw new NotFoundException('Join request not found')
    }

    if (joinRequest.status !== JoinRequestStatus.PENDING) {
      throw new BadRequestException(`Cannot reject a request with status: ${joinRequest.status}`)
    }

    // Update request status
    joinRequest.status = JoinRequestStatus.REJECTED
    joinRequest.reviewedById = actorId
    joinRequest.reviewedAt = new Date()
    return this.joinRequestRepository.save(joinRequest)
  }

  /**
   * Get user's membership status in a fund
   */
  async getMembershipStatus(fundId: string, userId: string) {
    // Check if fund exists
    await this.findByIdOrThrow(fundId)

    const membership = await this.memberRepository.findOne({
      where: { fundId, userId },
    })

    const joinRequest = await this.joinRequestRepository.findOne({
      where: { fundId, userId },
      order: { createdAt: 'DESC' }, 
    })

    return {
      isMember: !!membership,
      role: membership?.role || null,
      joinRequest: joinRequest
        ? {
            id: joinRequest.id,
            status: joinRequest.status,
            createdAt: joinRequest.createdAt,
            reviewedAt: joinRequest.reviewedAt,
          }
        : null,
    }
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    fundId: string,
    memberId: string,
    newRole: FundMemberRole,
    actorId: string,
  ): Promise<FundMember> {
    // Check permissions
    await this.assertAdminOrOwner(fundId, actorId)

    const member = await this.memberRepository.findOne({
      where: { id: memberId, fundId },
    })

    if (!member) {
      throw new NotFoundException('Member not found')
    }

    // Prevent changing owner role
    if (member.role === FundMemberRole.OWNER) {
      throw new ForbiddenException('Cannot change owner role')
    }

    // Prevent non-owners from assigning owner role
    if (newRole === FundMemberRole.OWNER) {
      const actorMembership = await this.memberRepository.findOne({
        where: { fundId, userId: actorId },
      })
      if (actorMembership?.role !== FundMemberRole.OWNER) {
        throw new ForbiddenException('Only owners can assign owner role')
      }
    }

    member.role = newRole
    return this.memberRepository.save(member)
  }

  /**
   * Remove member (updated to support role-based permissions)
   */
  async removeMember(fundId: string, actorId: string, userId: string) {
    // Check permissions
    await this.assertAdminOrOwner(fundId, actorId)

    const member = await this.memberRepository.findOne({ where: { fundId, userId } })
    if (!member) {
      throw new NotFoundException('Member not found')
    }

    // Prevent removing owner
    if (member.role === FundMemberRole.OWNER) {
      throw new ForbiddenException('Cannot remove owner')
    }

    // Prevent non-owners from removing admins
    const actorMembership = await this.memberRepository.findOne({ where: { fundId, userId: actorId } })
    if (member.role === FundMemberRole.ADMIN && actorMembership?.role !== FundMemberRole.OWNER) {
      throw new ForbiddenException('Only owners can remove admins')
    }

    await this.memberRepository.delete({ fundId, userId })
  }
}
