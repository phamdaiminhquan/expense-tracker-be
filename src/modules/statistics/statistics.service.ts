import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Transaction } from '../transactions/transaction.entity'
import { FundsService } from '../funds/funds.service'

export interface StatisticsQuery {
  from?: Date
  to?: Date
}

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly fundsService: FundsService,
  ) {}

  async fundSummary(fundId: string, userId: string, query: StatisticsQuery) {
    await this.fundsService.assertMembership(fundId, userId)

    const builder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.fundId = :fundId', { fundId })
      .andWhere('transaction.status = :status', { status: 'processed' })

    if (query.from) {
      builder.andWhere('transaction.createdAt >= :from', { from: query.from })
    }

    if (query.to) {
      builder.andWhere('transaction.createdAt <= :to', { to: query.to })
    }

    const [totalSpend, totalEarn] = await Promise.all([
      builder.clone().select('COALESCE(SUM(transaction.spendValue), 0)', 'total').getRawOne<{ total: string }>(),
      builder.clone().select('COALESCE(SUM(transaction.earnValue), 0)', 'total').getRawOne<{ total: string }>(),
    ])

    return {
      fundId,
      totalSpend: Number(totalSpend?.total ?? 0),
      totalEarn: Number(totalEarn?.total ?? 0),
      net: Number(totalEarn?.total ?? 0) - Number(totalSpend?.total ?? 0),
    }
  }
}
