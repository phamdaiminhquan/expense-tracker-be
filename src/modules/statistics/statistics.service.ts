import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Message } from '../messages/message.entity'
import { FundsService } from '../funds/funds.service'

export interface StatisticsQuery {
  from?: Date
  to?: Date
}

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly fundsService: FundsService,
  ) {}

  async fundSummary(fundId: string, userId: string, query: StatisticsQuery) {
    await this.fundsService.assertMembership(fundId, userId)

    const builder = this.messageRepository
      .createQueryBuilder('message')
      .where('message.fundId = :fundId', { fundId })
      .andWhere('message.status = :status', { status: 'processed' })

    if (query.from) {
      builder.andWhere('message.createdAt >= :from', { from: query.from })
    }

    if (query.to) {
      builder.andWhere('message.createdAt <= :to', { to: query.to })
    }

    const [totalSpend, totalEarn] = await Promise.all([
      builder.clone().select('COALESCE(SUM(message.spendValue), 0)', 'total').getRawOne<{ total: string }>(),
      builder.clone().select('COALESCE(SUM(message.earnValue), 0)', 'total').getRawOne<{ total: string }>(),
    ])

    return {
      fundId,
      totalSpend: Number(totalSpend?.total ?? 0),
      totalEarn: Number(totalEarn?.total ?? 0),
      net: Number(totalEarn?.total ?? 0) - Number(totalSpend?.total ?? 0),
    }
  }
}
