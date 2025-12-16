import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

import { Fund } from '../funds/entity/fund.entity'
import { Category } from '../categories/category.entity'
import { BaseEntity } from '../../common/base.entity'
import { messageStatus } from './enums/message-status.enum'

@Entity('messages')
export class Message extends BaseEntity {

  @Column({ type: 'enum', enum: messageStatus, default: messageStatus.PENDING })
  status!: messageStatus

  @Column({ type: 'text' })
  message!: string

  @Column({ type: 'decimal', precision: 12, scale: 3, nullable: true })
  spendValue?: number

  @Column({ type: 'decimal', precision: 12, scale: 3, nullable: true })
  earnValue?: number

  @Column({ type: 'text', nullable: true })
  content?: string

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, unknown>

  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date

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
  category?: Category
}
