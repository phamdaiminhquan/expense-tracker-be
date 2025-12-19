import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Message } from './message.entity'
import { MessagesService } from './messages.service'
import { MessagesController } from './messages.controller'
import { FundsModule } from '../funds/funds.module'
import { UsersModule } from '../users/users.module'
import { AiModule } from '../ai/ai.module'
import { TransactionsModule } from '../transactions/transactions.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    forwardRef(() => FundsModule),
    UsersModule,
    AiModule,
    TransactionsModule,
  ],
  providers: [MessagesService],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}