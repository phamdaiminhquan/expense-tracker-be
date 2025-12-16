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
  message!: string

  @ApiPropertyOptional({ example: 45000, description: 'Spend amount extracted by AI (in VND)' })
  @Column({ type: 'decimal', precision: 12, scale: 3, nullable: true })
  spendValue?: number

  @ApiPropertyOptional({ example: 0, description: 'Earn amount extracted by AI (in VND)' })
  @Column({ type: 'decimal', precision: 12, scale: 3, nullable: true })
  earnValue?: number

  @ApiPropertyOptional({ example: 'Đồ ăn trưa', description: 'Extracted description from message' })
  @Column({ type: 'text', nullable: true })
  content?: string

  @ApiPropertyOptional({ description: 'Additional metadata from AI processing' })
  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, unknown>

  @ApiPropertyOptional({ example: '2024-01-15T10:35:00Z', description: 'When AI processing completed' })
  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date

  @ApiPropertyOptional({ example: 'AI parsing failed: invalid format', description: 'Error message if processing failed' })
  @Column({ type: 'text', nullable: true })
  failureReason?: string

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid', description: 'Fund ID' })
  @Column({ type: 'uuid' })
  fundId!: string

  @ApiPropertyOptional({ type: () => Fund, description: 'Associated fund' })
  @ManyToOne(() => Fund, (fund) => fund.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fundId' })
  fund!: Fund

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid', description: 'Category ID' })
  @Column({ type: 'uuid', nullable: true })
  categoryId?: string

  @ApiPropertyOptional({ type: () => Category, description: 'Associated category' })
  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category?: Category
}
