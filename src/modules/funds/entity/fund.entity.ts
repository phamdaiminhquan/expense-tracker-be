import { Column, Entity, OneToMany } from 'typeorm'

import { FundMember } from './fund-member.entity'
import { Transaction } from '../../transactions/transaction.entity'
import { BaseEntity } from '../../../common/base.entity'
import { FundType } from '../enums/fund-type.enum'

@Entity('funds')
export class Fund extends BaseEntity {

  @Column()
  name!: string

  @Column({ type: 'enum', enum: FundType, default: FundType.PERSONAL })
  type!: FundType

  @Column({ type: 'uuid' })
  ownerId!: string

  @OneToMany(() => FundMember, (member) => member.fund)
  memberships!: FundMember[]

  @OneToMany(() => Transaction, (transaction) => transaction.fund)
  transactions!: Transaction[]

}
