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
    await this.fundsService.assertMembership(fundId, userId);

    // Query from Transaction entity instead of Message
    const transactionRepo = this.messageRepository.manager.getRepository('Transaction');
    const qb = transactionRepo
      .createQueryBuilder('transaction')
      .where('transaction.fundId = :fundId', { fundId });

    if (query.from) {
      qb.andWhere('transaction.createdAt >= :from', { from: query.from });
    }
    if (query.to) {
      qb.andWhere('transaction.createdAt <= :to', { to: query.to });
    }

    const [spendResult, earnResult] = await Promise.all([
      qb.clone().select('COALESCE(SUM(transaction.spendValue), 0)', 'total').getRawOne<{ total: string }>(),
      qb.clone().select('COALESCE(SUM(transaction.earnValue), 0)', 'total').getRawOne<{ total: string }>(),
    ]);

    const totalSpend = Number(spendResult?.total ?? 0);
    const totalEarn = Number(earnResult?.total ?? 0);

    return {
      fundId,
      totalSpend,
      totalEarn,
      net: totalEarn - totalSpend,
    };
  }
}
