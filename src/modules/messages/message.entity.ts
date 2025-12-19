import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { Fund } from '../funds/entity/fund.entity'
import { Transaction } from '../transactions/transaction.entity'
import { BaseEntity } from '../../common/base.entity'
import { messageStatus } from './enums/message-status.enum'

@Entity('messages')
export class Message extends BaseEntity {
  @ApiProperty({ enum: messageStatus, example: messageStatus.PENDING, description: 'Processing status of the message' })
  @Column({ type: 'enum', enum: messageStatus, default: messageStatus.PENDING })
  status!: messageStatus

  @ApiProperty({ example: 'Mua đồ ăn trưa 45k', description: 'Original user message (prompt)' })
  @Column({ type: 'text', nullable: true })
  message!: string | null

  @ApiPropertyOptional({ description: 'Additional metadata from AI processing' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown> | null

  @ApiPropertyOptional({ example: '2024-01-15T10:35:00Z', description: 'When AI processing completed' })
  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date

  @ApiPropertyOptional({ example: 'AI parsing failed: invalid format', description: 'Error message if processing failed' })
  @Column({ type: 'text', nullable: true })
  failureReason?: string

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid', description: 'Fund ID' })
  @Column({ type: 'uuid' })
  fundId!: string

  @ManyToOne(() => Fund, (fund) => fund.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fundId' })
  fund!: Fund

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid', description: 'Transaction ID (if this message resulted in a transaction)' })
  @Column({ type: 'uuid', nullable: true })
  transactionId?: string | null

  @ApiPropertyOptional({ type: () => Transaction, description: 'Associated transaction (if this message created a transaction)' })
  @ManyToOne(() => Transaction, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'transactionId' })
  transaction?: Transaction | null
}
