import { Column, Entity, OneToMany } from 'typeorm'

import { FundMember } from './fund-member.entity'
import { Message } from '../../messages/message.entity'
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

  @OneToMany(() => Message, (message) => message.fund)
  messages!: Message[]

}
