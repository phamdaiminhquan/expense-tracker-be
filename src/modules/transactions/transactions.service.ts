import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { QueryDeepPartialEntity, Repository } from 'typeorm'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'

import { Transaction } from './transaction.entity'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { UpdateTransactionDto } from './dto/update-transaction.dto'
import { FundsService } from '../funds/funds.service'
import { TRANSACTION_PARSE_JOB, TRANSACTION_PARSE_QUEUE } from '../jobs/job.constants'
import { TransactionStatus } from './enums/transaction-status.enum'

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly fundsService: FundsService,
    @InjectQueue(TRANSACTION_PARSE_QUEUE)
    private readonly parseQueue: Queue,
  ) {}

  async listByFund(fundId: string, userId: string) {
    await this.fundsService.assertMembership(fundId, userId)
    return this.transactionRepository.find({ where: { fundId }, order: { createdAt: 'DESC' } })
  }

  async findByIdForUser(transactionId: string, userId: string) {
    const transaction = await this.transactionRepository.findOne({ where: { id: transactionId } })
    if (!transaction) {
      throw new NotFoundException('Transaction not found')
    }
    await this.fundsService.assertMembership(transaction.fundId, userId)
    return transaction
  }

  async create(userId: string, userName: string, fundId: string, dto: CreateTransactionDto) {
    await this.fundsService.assertMembership(fundId, userId)

    const status: TransactionStatus = dto.spendValue !== undefined || dto.earnValue !== undefined
      ? TransactionStatus.PROCESSED
      : TransactionStatus.PENDING

    const transaction = this.transactionRepository.create({
      fundId,
      userId,
      userName,
      rawPrompt: dto.rawPrompt,
      status,
      spendValue: dto.spendValue ?? null,
      earnValue: dto.earnValue ?? null,
      content: dto.content ?? null,
      categoryId: dto.categoryId ?? null,
      processedAt: status === 'processed' ? new Date() : null,
    })

    const saved = await this.transactionRepository.save(transaction)

    if (status === 'pending') {
      await this.enqueueForParsing(saved)
    }

    return saved
  }

  async update(transactionId: string, userId: string, dto: UpdateTransactionDto) {
    const transaction = await this.findByIdForUser(transactionId, userId)

    if (dto.spendValue !== undefined) {
      transaction.spendValue = dto.spendValue
    }

    if (dto.earnValue !== undefined) {
      transaction.earnValue = dto.earnValue
    }

    if (dto.content !== undefined) {
      transaction.content = dto.content
    }

    if (dto.categoryId !== undefined) {
      transaction.categoryId = dto.categoryId
    }

    if (dto.rawPrompt !== undefined) {
      transaction.rawPrompt = dto.rawPrompt
    }

    return this.transactionRepository.save(transaction)
  }

  async remove(transactionId: string, userId: string) {
    const transaction = await this.findByIdForUser(transactionId, userId)
    if (!transaction) {
      return null
    }
    await this.transactionRepository.softDelete({ id: transactionId })
    return { success: true }
  }

  async markProcessed(
    transactionId: string,
    payload: {
      spendValue: number | null
      earnValue: number | null
      content: string
      categoryId?: string | null
      metadata?: Transaction['metadata']
    },
  ) {
    const metadataValue = (payload.metadata ?? null) as QueryDeepPartialEntity<Transaction['metadata']>

    const updatePayload: QueryDeepPartialEntity<Transaction> = {
      status: TransactionStatus.PROCESSED,
      spendValue: payload.spendValue,
      earnValue: payload.earnValue,
      content: payload.content,
      categoryId: payload.categoryId ?? null,
      metadata: metadataValue,
      processedAt: new Date(),
      failureReason: null,
    }

    await this.transactionRepository.update({ id: transactionId }, updatePayload)
  }

  async markFailed(transactionId: string, reason: string) {
    await this.transactionRepository.update(
      { id: transactionId },
      {
        status: TransactionStatus.FAILED,
        failureReason: reason,
        processedAt: new Date(),
      },
    )
  }

  private async enqueueForParsing(transaction: Transaction) {
    await this.parseQueue.add(
      TRANSACTION_PARSE_JOB,
      {
        transactionId: transaction.id,
        fundId: transaction.fundId,
        userId: transaction.userId,
        prompt: transaction.rawPrompt,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    )
  }
}
