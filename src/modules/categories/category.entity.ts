import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { Fund } from '../funds/entity/fund.entity'
import { BaseEntity } from '../../common/base.entity'
import { FundCategory } from './fund-category.entity'

@Entity('categories')
export class Category extends BaseEntity {
  @ApiProperty({ example: 'Food & Drinks', description: 'Category name' })
  @Column()
  name!: string

  @ApiPropertyOptional({ example: 'Groceries, eating out...', description: 'Category description' })
  @Column({ type: 'text', nullable: true })
  description?: string

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid', description: 'Parent category ID (for hierarchical structure)' })
  @Column({ type: 'uuid', nullable: true })
  parentId?: string | null

  @ApiPropertyOptional({ type: () => Category, description: 'Parent category' })
  @ManyToOne(() => Category, (category) => category.children, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent?: Category | null

  @ApiPropertyOptional({ type: () => [Category], description: 'Child categories' })
  @OneToMany(() => Category, (category) => category.parent)
  children!: Category[]

  @ApiProperty({ example: true, description: 'Whether this is a default system category' })
  @Column({ type: 'boolean', default: false })
  isDefault!: boolean

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid', description: 'Fund ID (null for default categories, set for custom categories)' })
  @Column({ type: 'uuid', nullable: true })
  fundId?: string | null

  @ApiPropertyOptional({ type: () => Fund, description: 'Associated fund (only for custom categories)' })
  @ManyToOne(() => Fund, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fundId' })
  fund?: Fund | null

  @ApiPropertyOptional({ type: () => [FundCategory], description: 'Fund-category relationships' })
  @OneToMany(() => FundCategory, (fundCategory) => fundCategory.category)
  fundCategories!: FundCategory[]

  // Unique constraint: default categories are unique by name, custom categories are unique by (fundId, name)
  // This is handled at application level since TypeORM doesn't support conditional unique constraints easily
}
