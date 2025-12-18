import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { Fund } from '../funds/entity/fund.entity'
import { Category } from '../categories/category.entity'
import { BaseEntity } from '../../common/base.entity'
import { messageStatus } from './enums/message-status.enum'

@Entity('messages')
export class Message extends BaseEntity {

  @ApiProperty({ enum: messageStatus, example: messageStatus.PENDING, description: 'Processing status of the message' })
  @Column({ type: 'enum', enum: messageStatus, default: messageStatus.PENDING })
  status!: messageStatus

  @ApiProperty({ example: 'Mua đồ ăn trưa 45k', description: 'Original user message (prompt)' })
  @Column({ type: 'text' })
  message!: string | null

  @ApiPropertyOptional({ example: 45000, description: 'Spend amount extracted by AI (in VND)' })
  @Column({ type: 'decimal', precision: 12, scale: 3, nullable: true })
  spendValue?: number | null

  @ApiPropertyOptional({ example: 0, description: 'Earn amount extracted by AI (in VND)' })
  @Column({ type: 'decimal', precision: 12, scale: 3, nullable: true })
  earnValue?: number | null

  @ApiPropertyOptional({ example: 'Đồ ăn trưa', description: 'Extracted description from message' })
  @Column({ type: 'text', nullable: true })
  content?: string

  @ApiPropertyOptional({ description: 'Additional metadata from AI processing' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown> | null

  @ApiPropertyOptional({ example: '2024-01-15T10:35:00Z', description: 'When AI processing completed' })
  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date

  @ApiPropertyOptional({ example: 'AI parsing failed: invalid format', description: 'Error message if processing failed' })
  @Column({ type: 'text', nullable: true })
  failureReason?: string

  @Column({ type: 'uuid' })
  fundId!: string
  @ManyToOne(() => Fund, (fund) => fund.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fundId' })
  fund!: Fund

  @Column({ type: 'uuid', nullable: true })
  categoryId?: string
  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category?: Category | null
}
