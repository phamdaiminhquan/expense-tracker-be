import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { QueryDeepPartialEntity, Repository } from 'typeorm'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'

import { Message } from './message.entity'
import { CreatemessageDto } from './dto/create-message.dto'
import { UpdatemessageDto } from './dto/update-message.dto'
import { FundsService } from '../funds/funds.service'
import { MESSAGE_PARSE_JOB, MESSAGE_PARSE_QUEUE } from '../jobs/job.constants'
import { messageStatus } from './enums/message-status.enum'
import { User } from '../users/user.entity'

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly fundsService: FundsService,
    @InjectQueue(MESSAGE_PARSE_QUEUE)
    private readonly parseQueue: Queue,
  ) {}

  async listByFund(fundId: string, userId: string) {
    await this.fundsService.assertMembership(fundId, userId)
    return this.messageRepository.find({ where: { fundId }, order: { createdAt: 'DESC' } })
  }

  async findByIdForUser(messageId: string, userId: string) {
    const message = await this.messageRepository.findOne({ where: { id: messageId } })
    if (!message) {
      throw new NotFoundException('message not found')
    }
    await this.fundsService.assertMembership(message.fundId, userId)
    return message
  }

  async create(user: User, fundId: string, dto: CreatemessageDto) {
    await this.fundsService.assertMembership(fundId, user.id)
    const message = this.messageRepository.create({
      fundId: fundId,
      message: dto.message,
      status: messageStatus.PENDING,
      createdById: user.id,
    })

    const saved = await this.messageRepository.save(message)

    await this.enqueueForParsing(saved)

    return saved
  }

  async update(messageId: string, userId: string, dto: UpdatemessageDto) {
    const message = await this.findByIdForUser(messageId, userId)
    return this.messageRepository.save(message)
  }

  async remove(messageId: string, userId: string) {
    const message = await this.findByIdForUser(messageId, userId)
    if (!message) {
      return null
    }
    await this.messageRepository.softDelete({ id: messageId })
    return { success: true }
  }

  async markProcessed(
    messageId: string,
    payload: {
      spendValue: number | null
      earnValue: number | null
      content: string
      categoryId?: string | null
      metadata?: Message['metadata']
    },
  ) {
    const metadataValue = (payload.metadata ?? null) as QueryDeepPartialEntity<Message['metadata']>

    const updatePayload: QueryDeepPartialEntity<Message> = {
      status: messageStatus.PROCESSED,
      content: payload.content,
      metadata: metadataValue,
      processedAt: new Date(),
    }

    await this.messageRepository.update({ id: messageId }, updatePayload)
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

  private async enqueueForParsing(message: Message) {
    await this.parseQueue.add(
      MESSAGE_PARSE_JOB,
      {
        messageId: message.id,
        fundId: message.fundId,
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
