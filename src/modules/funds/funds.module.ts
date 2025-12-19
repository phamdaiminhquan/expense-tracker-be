import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Fund } from './entity/fund.entity'
import { FundMember } from './entity/fund-member.entity'
import { FundsService } from './funds.service'
import { FundsController } from './funds.controller'
import { CategoriesModule } from '../categories/categories.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Fund, FundMember]),
    forwardRef(() => CategoriesModule),
  ],
  providers: [FundsService],
  controllers: [FundsController],
  exports: [FundsService],
})
export class FundsModule {}
