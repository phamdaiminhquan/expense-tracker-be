import { Module, forwardRef } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'

import { MESSAGE_PARSE_QUEUE, MESSAGE_PARSE_JOB } from './job.constants'
import { MessageParseProcessor } from './transaction-parse.processor'
import { MessagesModule } from '../messages/messages.module'
import { AiModule } from '../ai/ai.module'

@Module({
  imports: [
    BullModule.registerQueue({
      name: MESSAGE_PARSE_QUEUE,
    }),
    forwardRef(() => MessagesModule),
    AiModule,
  ],
  providers: [MessageParseProcessor],
  exports: [BullModule],
})
export class JobsModule {}
