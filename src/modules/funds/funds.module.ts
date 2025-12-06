import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Fund } from './fund.entity'
import { FundMember } from './fund-member.entity'
import { FundsService } from './funds.service'
import { FundsController } from './funds.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Fund, FundMember])],
  providers: [FundsService],
  controllers: [FundsController],
  exports: [FundsService],
})
export class FundsModule {}
