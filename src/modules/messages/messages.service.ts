
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { QueryDeepPartialEntity, Repository } from 'typeorm'

import { Message } from './message.entity'
import { CreatemessageDto } from './dto/create-message.dto'
import { UpdatemessageDto } from './dto/update-message.dto'
import { FundsService } from '../funds/funds.service'
import { messageStatus } from './enums/message-status.enum'
import { User } from '../users/user.entity'
import { ModelService } from '../ai/model.service'
import { TransactionsService } from '../transactions/transactions.service'
import { ParsedExpensePayload } from '../ai/interfaces/parsed-expense.interface'

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    private readonly modelService: ModelService,
    private readonly fundsService: FundsService,
    private readonly transactionsService: TransactionsService,
  ) { }

  async listByFund(fundId: string, userId: string) {
    await this.fundsService.assertMembership(fundId, userId)
    return this.messageRepository.find({
      where: { fundId },
      relations: ['fund', 'transaction', 'transaction.category', 'transaction.category.parent'],
      order: { createdAt: 'DESC' },
    })
  }

  async findByIdForUser(messageId: string, userId: string) {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['fund', 'transaction', 'transaction.category', 'transaction.category.parent'],
    })
    if (!message) throw new NotFoundException('message not found')

    await this.fundsService.assertMembership(message.fundId, userId)
    return message
  }

  async create(user: User, fundId: string, dto: CreatemessageDto) {
    await this.fundsService.assertMembership(fundId, user.id)

    let aiPayload: ParsedExpensePayload | null = null
    let aiError: unknown = null

    try {
      aiPayload = await this.modelService.parseExpense({ fundId, prompt: dto.message })
    } catch (err) {
      aiError = err
    }

    const hasTransactionData = !!aiPayload && (aiPayload.spendValue !== null || aiPayload.earnValue !== null)
    const status = hasTransactionData ? messageStatus.PROCESSED : messageStatus.FAILED
    const failureReason = status === messageStatus.FAILED
      ? (aiError ? String(aiError) : 'Could not extract amount')
      : undefined

    const message = this.messageRepository.create({
      fundId,
      message: dto.message,
      status,
      createdById: user.id,
      metadata: aiPayload?.metadata ?? undefined,
      failureReason,
    })

    const savedMessage = await this.messageRepository.save(message)
    await this.fundsService.updateFundLastMessage(fundId)

    if (hasTransactionData && aiPayload) {
      const transaction = await this.transactionsService.create({
        fundId,
        createdById: user.id,
        categoryId: aiPayload.categoryId ?? undefined,
        spendValue: aiPayload.spendValue ?? undefined,
        earnValue: aiPayload.earnValue ?? undefined,
        content: aiPayload.content ?? undefined,
        metadata: aiPayload.metadata ?? undefined,
      })

      await this.messageRepository.update(savedMessage.id, { transactionId: transaction.id })
    }

    const reloaded = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['fund', 'transaction', 'transaction.category', 'transaction.category.parent'],
    })

    return reloaded || savedMessage
  }

  async update(messageId: string, userId: string, dto: UpdatemessageDto) {
    const message = await this.findByIdForUser(messageId, userId)

    const content = dto.message ?? message.message
    const hasContent = !!content && content.trim().length > 0

    let aiPayload: ParsedExpensePayload | null = null

    if (hasContent) {
      try {
        aiPayload = await this.modelService.parseExpense({ fundId: message.fundId, prompt: content })
      } catch {
        aiPayload = null
      }
    }

    const hasTransactionData = !!aiPayload && (aiPayload.spendValue !== null || aiPayload.earnValue !== null)

    if (!hasTransactionData) {
      return message
    }

    if (dto.message !== undefined) {
      message.message = dto.message
    }

    message.status = messageStatus.PROCESSED
    message.metadata = aiPayload?.metadata ?? null
    message.failureReason = null
    message.processedAt = new Date()

    await this.messageRepository.save(message)

    const transactionPayload = {
      fundId: message.fundId,
      createdById: message.createdById || userId,
      categoryId: aiPayload?.categoryId ?? null,
      spendValue: aiPayload?.spendValue ?? null,
      earnValue: aiPayload?.earnValue ?? null,
      content: aiPayload?.content ?? null,
      metadata: aiPayload?.metadata ?? null,
      createdAt: message.createdAt,
    }

    if (message.transactionId) {
      await this.transactionsService.update(message.transactionId, transactionPayload)
    } else {
      const transaction = await this.transactionsService.create(transactionPayload)
      await this.transactionsService.update(transaction.id, { createdAt: message.createdAt })
      await this.messageRepository.update(message.id, { transactionId: transaction.id })
    }

    return this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['fund', 'transaction', 'transaction.category', 'transaction.category.parent'],
    }) || message
  }

  async remove(messageId: string, userId: string) {
    const message = await this.findByIdForUser(messageId, userId)
    if (!message) return null

    const fundId = message.fundId
    await this.messageRepository.softDelete({ id: messageId })

    if (message.transactionId)
      await this.transactionsService.delete(message.transactionId)

    await this.fundsService.updateFundLastMessage(fundId)

    return { success: true }
  }
}
