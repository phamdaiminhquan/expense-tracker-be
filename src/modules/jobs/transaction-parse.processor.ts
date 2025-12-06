import { Injectable, Logger } from '@nestjs/common'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'

import { TRANSACTION_PARSE_JOB, TRANSACTION_PARSE_QUEUE } from './job.constants'
import { TransactionsService } from '../transactions/transactions.service'
import { ModelService } from '../ai/model.service'

interface TransactionParseJobData {
  transactionId: string
  fundId: string
  userId: string
  prompt: string
}

@Injectable()
@Processor(TRANSACTION_PARSE_QUEUE)
export class TransactionParseProcessor extends WorkerHost {
  private readonly logger = new Logger(TransactionParseProcessor.name)

  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly modelService: ModelService,
  ) {
    super()
  }

  async process(job: Job<TransactionParseJobData, unknown, typeof TRANSACTION_PARSE_JOB>): Promise<void> {
    const { transactionId, fundId, prompt } = job.data

    this.logger.debug(`Processing transaction ${transactionId}`)

    try {
      const result = await this.modelService.parseExpense({ fundId, prompt })
      await this.transactionsService.markProcessed(transactionId, result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      await this.transactionsService.markFailed(transactionId, message)
      this.logger.error(`Failed to process transaction ${transactionId}: ${message}`)
      throw error
    }
  }
}
