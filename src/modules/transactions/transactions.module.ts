import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BullModule } from '@nestjs/bullmq'

import { Transaction } from './transaction.entity'
import { TransactionsService } from './transactions.service'
import { TransactionsController } from './transactions.controller'
import { FundsModule } from '../funds/funds.module'
import { UsersModule } from '../users/users.module'
import { TRANSACTION_PARSE_QUEUE } from '../jobs/job.constants'

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    BullModule.registerQueue({ name: TRANSACTION_PARSE_QUEUE }),
    forwardRef(() => FundsModule),
    UsersModule,
  ],
  providers: [TransactionsService],
  controllers: [TransactionsController],
  exports: [TransactionsService],
})
export class TransactionsModule {}
