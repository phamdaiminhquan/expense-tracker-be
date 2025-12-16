import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { Fund } from '../funds/entity/fund.entity'
import { BaseEntity } from '../../common/base.entity'

@Entity('categories')
@Unique(['fundId', 'name'])
export class Category extends BaseEntity {

  @ApiProperty({ example: 'Food & Drinks', description: 'Category name' })
  @Column()
  name!: string

  @ApiPropertyOptional({ example: 'Groceries, eating out...', description: 'Category description' })
  @Column({ type: 'text', nullable: true })
  description?: string

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid', description: 'Fund ID' })
  @Column({ type: 'uuid' })
  fundId!: string

  @ApiPropertyOptional({ type: () => Fund, description: 'Associated fund' })
  @ManyToOne(() => Fund, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fundId' })
  fund!: Fund

}
