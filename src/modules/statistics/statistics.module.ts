import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { StatisticsService } from './statistics.service'
import { StatisticsController } from './statistics.controller'
import { Transaction } from '../transactions/transaction.entity'
import { FundsModule } from '../funds/funds.module'

@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), forwardRef(() => FundsModule)],
  providers: [StatisticsService],
  controllers: [StatisticsController],
})
export class StatisticsModule {}
