import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'

import { Fund } from './fund.entity'
import { User } from '../users/user.entity'
import { BaseEntity } from '../../common/base.entity'

export type FundMemberRole = 'owner' | 'member'

@Entity('fund_members')
@Unique(['fundId', 'userId'])
export class FundMember extends BaseEntity {

  @Column({ type: 'uuid' })
  fundId!: string

  @Column({ type: 'uuid' })
  userId!: string

  @Column({ type: 'enum', enum: ['owner', 'member'], default: 'member' })
  role!: FundMemberRole

  @ManyToOne(() => Fund, (fund) => fund.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fundId' })
  fund!: Fund

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User

}
