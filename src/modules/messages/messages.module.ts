import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BullModule } from '@nestjs/bullmq'

import { Message } from './message.entity'
import { MessagesService } from './messages.service'
import { MessagesController } from './messages.controller'
import { FundsModule } from '../funds/funds.module'
import { UsersModule } from '../users/users.module'
import { MESSAGE_PARSE_QUEUE } from '../jobs/job.constants'
import { AiModule } from '../ai/ai.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    BullModule.registerQueue({ name: MESSAGE_PARSE_QUEUE }),
    forwardRef(() => FundsModule),
    UsersModule,
    AiModule,
  ],
  providers: [MessagesService],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}