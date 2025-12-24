import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { Fund } from '../funds/entity/fund.entity'
import { BaseEntity } from '../../common/base.entity'
import { FundCategory } from './fund-category.entity'
import { CategoryStatus } from './category.enum'

@Entity('categories')
export class Category extends BaseEntity {
  @Column()
  name!: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'text', nullable: true, default: null })
  image?: string

  @Column({
    type: 'enum',
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE,
  })
  status?: CategoryStatus

  @Column({ type: 'uuid', nullable: true })
  parentId?: string | null

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent?: Category | null

  @OneToMany(() => Category, (category) => category.parent)
  children!: Category[]

  @Column({ type: 'boolean', default: false })
  isDefault!: boolean

  @Column({ type: 'uuid', nullable: true })
  fundId?: string | null

  @ManyToOne(() => Fund, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fundId' })
  fund?: Fund | null

  @OneToMany(() => FundCategory, (fundCategory) => fundCategory.category)
  fundCategories!: FundCategory[]
}
