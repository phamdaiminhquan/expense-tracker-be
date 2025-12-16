import { Injectable, Logger } from '@nestjs/common'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'

import { MESSAGE_PARSE_JOB, MESSAGE_PARSE_QUEUE } from './job.constants'
import { MessagesService } from '../messages/messages.service'
import { ModelService } from '../ai/model.service'

interface MessageParseJobData {
  messageId: string
  fundId: string
  userId: string
  prompt: string
}

@Injectable()
@Processor(MESSAGE_PARSE_QUEUE)
export class MessageParseProcessor extends WorkerHost {
  private readonly logger = new Logger(MessageParseProcessor.name)

  constructor(
    private readonly messagesService: MessagesService,
    private readonly modelService: ModelService,
  ) {
    super()
  }

  async process(job: Job<MessageParseJobData, unknown, typeof MESSAGE_PARSE_JOB>): Promise<void> {
    const { messageId, fundId, prompt } = job.data

    this.logger.debug(`Processing message ${messageId}`)

    try {
      const result = await this.modelService.parseExpense({ fundId, prompt })
      await this.messagesService.markProcessed(messageId, result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      await this.messagesService.markFailed(messageId, message)
      this.logger.error(`Failed to process message ${messageId}: ${message}`)
      throw error
    }
  }
}
