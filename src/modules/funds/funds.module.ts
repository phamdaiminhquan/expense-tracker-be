import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Fund } from './entity/fund.entity'
import { FundMember } from './entity/fund-member.entity'
import { FundJoinRequest } from './entity/fund-join-request.entity'
import { Message } from '../messages/message.entity'
import { FundsService } from './funds.service'
import { FundsController } from './funds.controller'
import { CategoriesModule } from '../categories/categories.module'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Fund, FundMember, FundJoinRequest, Message]),
    forwardRef(() => CategoriesModule),
    UsersModule,
  ],
  providers: [FundsService],
  controllers: [FundsController],
  exports: [FundsService],
})
export class FundsModule {}
