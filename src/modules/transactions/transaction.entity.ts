import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { Fund } from '../funds/entity/fund.entity'
import { Category } from '../categories/category.entity'
import { BaseEntity } from '../../common/base.entity'

@Entity('transactions')
export class Transaction extends BaseEntity {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid', description: 'Fund ID' })
  @Column({ type: 'uuid' })
  fundId!: string

  @ManyToOne(() => Fund, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fundId' })
  fund!: Fund

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid', description: 'User who created this transaction' })
  @Column({ type: 'uuid' })
  createdById!: string

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid', description: 'Category ID (optional)' })
  @Column({ type: 'uuid', nullable: true })
  categoryId?: string | null

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category?: Category | null

  @ApiPropertyOptional({ example: 45000, description: 'Spend amount (in VND)' })
  @Column({ type: 'decimal', precision: 12, scale: 3, nullable: true })
  spendValue?: number | null

  @ApiPropertyOptional({ example: 0, description: 'Earn amount (in VND)' })
  @Column({ type: 'decimal', precision: 12, scale: 3, nullable: true })
  earnValue?: number | null

  @ApiPropertyOptional({ example: 'Đồ ăn trưa', description: 'Transaction description/content' })
  @Column({ type: 'text', nullable: true })
  content?: string | null

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown> | null
}

