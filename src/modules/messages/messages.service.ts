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

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    private readonly modelService: ModelService,
    private readonly fundsService: FundsService,
    private readonly transactionsService: TransactionsService,
  ) {}

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
    if (!message) {
      throw new NotFoundException('message not found')
    }
    await this.fundsService.assertMembership(message.fundId, userId)
    return message
  }

  async create(user: User, fundId: string, dto: CreatemessageDto) {
    // check user is member of fund
    await this.fundsService.assertMembership(fundId, user.id)

    // call AI service
    const aiPayload = await this.modelService.parseExpense({ fundId, prompt: dto.message })
    
    // create message
    const message = this.messageRepository.create({
      fundId: fundId,
      message: dto.message ?? null,
      status: messageStatus.PROCESSED,
      createdById: user.id,
      metadata: aiPayload.metadata ?? null,
    })
  
    // save message first
    const savedMessage = await this.messageRepository.save(message)

    // Update fund's lastMessage (denormalized for performance)
    await this.fundsService.updateFundLastMessage(fundId)

    // If AI extracted transaction data, create a transaction
    if (aiPayload.spendValue !== null || aiPayload.earnValue !== null || aiPayload.content) {
      const transaction = await this.transactionsService.create({
        fundId,
        createdById: user.id,
        categoryId: aiPayload.categoryId ?? null,
        spendValue: aiPayload.spendValue ?? null,
        earnValue: aiPayload.earnValue ?? null,
        content: aiPayload.content ?? null,
        metadata: aiPayload.metadata ?? null,
      })

      // Link transaction to message
      savedMessage.transactionId = transaction.id
      await this.messageRepository.save(savedMessage)
      
      // Reload message with relations to return complete data
      return this.messageRepository.findOne({
        where: { id: savedMessage.id },
        relations: ['fund', 'transaction', 'transaction.category', 'transaction.category.parent'],
      }) || savedMessage
    }

    // Reload message with relations even if no transaction was created
    return this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['fund', 'transaction', 'transaction.category', 'transaction.category.parent'],
    }) || savedMessage
  }

  async update(messageId: string, userId: string, dto: UpdatemessageDto) {
    const message = await this.findByIdForUser(messageId, userId)
    Object.assign(message, dto)
    await this.messageRepository.save(message)
    
    // Reload with relations to return complete data
    return this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['fund', 'transaction', 'transaction.category', 'transaction.category.parent'],
    }) || message
  }

  async remove(messageId: string, userId: string) {
    const message = await this.findByIdForUser(messageId, userId)
    if (!message) {
      return null
    }
    
    const fundId = message.fundId
    await this.messageRepository.softDelete({ id: messageId })
    
    // Update fund's lastMessage after deletion (might be previous message now)
    await this.fundsService.updateFundLastMessage(fundId)
    
    return { success: true }
  }

  async markProcessed(
    messageId: string,
    payload: {
      spendValue: number | null
      earnValue: number | null
      content: string
      categoryId?: string | null
      metadata?: Message['metadata'] | null
    },
  ) {
    // Note: This method is kept for potential async processing in the future
    // Currently, transactions are created synchronously in create() method
    // If needed, this can create a transaction and link it to the message
    
    const metadataValue = (payload.metadata ?? null) as QueryDeepPartialEntity<Message['metadata']>

    const updatePayload: QueryDeepPartialEntity<Message> = {
      status: messageStatus.PROCESSED,
      metadata: metadataValue,
      processedAt: new Date(),
    }

    await this.messageRepository.update({ id: messageId }, updatePayload)

    // If transaction data exists, create a transaction
    if (payload.spendValue !== null || payload.earnValue !== null || payload.content) {
      const message = await this.messageRepository.findOne({ where: { id: messageId } })
      if (message) {
        const transaction = await this.transactionsService.create({
          fundId: message.fundId,
          createdById: message.createdById || '',
          categoryId: payload.categoryId ?? null,
          spendValue: payload.spendValue ?? null,
          earnValue: payload.earnValue ?? null,
          content: payload.content ?? null,
          metadata: payload.metadata ?? null,
        })

        message.transactionId = transaction.id
        await this.messageRepository.save(message)
      }
    }
  }

  async markFailed(messageId: string, reason: string) {
    await this.messageRepository.update(
      { id: messageId },
      {
        status: messageStatus.FAILED,
        failureReason: reason,
        processedAt: new Date(),
      },
    )
  }
}
