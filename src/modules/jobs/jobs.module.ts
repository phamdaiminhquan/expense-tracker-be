import { Module, forwardRef } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'

import { TRANSACTION_PARSE_QUEUE } from './job.constants'
import { TransactionParseProcessor } from './transaction-parse.processor'
import { TransactionsModule } from '../transactions/transactions.module'
import { AiModule } from '../ai/ai.module'

@Module({
  imports: [
    BullModule.registerQueue({
      name: TRANSACTION_PARSE_QUEUE,
    }),
    forwardRef(() => TransactionsModule),
    AiModule,
  ],
  providers: [TransactionParseProcessor],
  exports: [BullModule],
})
export class JobsModule {}
