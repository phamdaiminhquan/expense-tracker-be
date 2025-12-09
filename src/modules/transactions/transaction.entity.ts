import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

import { Fund } from '../funds/entity/fund.entity'
import { Category } from '../categories/category.entity'
import { BaseEntity } from '../../common/base.entity'
import { TransactionStatus } from './enums/transaction-status.enum'

@Entity('transactions')
export class Transaction extends BaseEntity {

  @Column({ type: 'uuid' })
  fundId!: string

  @Column({ type: 'uuid' })
  userId!: string

  @Column()
  userName!: string

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  status!: TransactionStatus

  @Column({ type: 'text' })
  rawPrompt!: string

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  spendValue?: number | null

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  earnValue?: number | null

  @Column({ type: 'text', nullable: true })
  content?: string | null

  @Column({ type: 'uuid', nullable: true })
  categoryId?: string | null

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, unknown> | null

  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date | null

  @Column({ type: 'text', nullable: true })
  failureReason?: string | null

  @ManyToOne(() => Fund, (fund) => fund.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fundId' })
  fund!: Fund

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category?: Category | null

}
