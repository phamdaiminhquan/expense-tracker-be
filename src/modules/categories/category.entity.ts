import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'

import { Fund } from '../funds/entity/fund.entity'
import { BaseEntity } from '../../common/base.entity'

@Entity('categories')
@Unique(['fundId', 'name'])
export class Category extends BaseEntity {
  
  @Column()
  name!: string
  
  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'uuid' })
  fundId!: string
  @ManyToOne(() => Fund, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fundId' })
  fund!: Fund

}
