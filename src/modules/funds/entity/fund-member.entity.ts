import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'

import { Fund } from '../entity/fund.entity'
import { User } from '../../users/user.entity'
import { BaseEntity } from '../../../common/base.entity'
import { FundMemberRole } from '../enums/fund-member-role.enum'

@Entity('fund_members')
@Unique(['fundId', 'userId'])
export class FundMember extends BaseEntity {

  @Column({ type: 'uuid' })
  fundId!: string

  @Column({ type: 'uuid' })
  userId!: string

  @Column({ type: 'enum', enum: FundMemberRole, default: FundMemberRole.MEMBER })
  role!: FundMemberRole

  @ManyToOne(() => Fund, (fund) => fund.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fundId' })
  fund!: Fund

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User

}
