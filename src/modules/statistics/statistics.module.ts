import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { StatisticsService } from './statistics.service'
import { StatisticsController } from './statistics.controller'
import { Message } from '../messages/message.entity'
import { FundsModule } from '../funds/funds.module'

@Module({
  imports: [TypeOrmModule.forFeature([Message]), forwardRef(() => FundsModule)],
  providers: [StatisticsService],
  controllers: [StatisticsController],
})
export class StatisticsModule {}
