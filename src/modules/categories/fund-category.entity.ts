import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'

import { BaseEntity } from '../../common/base.entity'
import { Fund } from '../funds/entity/fund.entity'
import { Category } from './category.entity'

@Entity('fund_categories')
@Unique(['fundId', 'categoryId'])
export class FundCategory extends BaseEntity {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid', description: 'Fund ID' })
  @Column({ type: 'uuid' })
  fundId!: string

  @ManyToOne(() => Fund, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fundId' })
  fund!: Fund

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid', description: 'Category ID' })
  @Column({ type: 'uuid' })
  categoryId!: string

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId' })
  category!: Category

  @ApiProperty({ example: true, description: 'Whether this category is active/enabled for this fund' })
  @Column({ type: 'boolean', default: true })
  isActive!: boolean
}

