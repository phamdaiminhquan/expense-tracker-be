import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'

import { Fund } from './fund.entity'
import { FundMember, FundMemberRole } from './fund-member.entity'
import { CreateFundDto } from './dto/create-fund.dto'
import { UpdateFundDto } from './dto/update-fund.dto'

@Injectable()
export class FundsService {
  constructor(
    @InjectRepository(Fund)
    private readonly fundRepository: Repository<Fund>,
    @InjectRepository(FundMember)
    private readonly memberRepository: Repository<FundMember>,
  ) {}

  async create(ownerId: string, dto: CreateFundDto): Promise<Fund> {
    const fund = this.fundRepository.create({
      name: dto.name,
      type: dto.type,
      ownerId,
    })

    const savedFund = await this.fundRepository.save(fund)

    const memberIds = Array.from(new Set([ownerId, ...(dto.memberIds ?? [])]))

    const members = memberIds.map((memberId) =>
      this.memberRepository.create({
        fundId: savedFund.id,
        userId: memberId,
        role: memberId === ownerId ? 'owner' : 'member',
      }),
    )

    await this.memberRepository.save(members)

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
}
