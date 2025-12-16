import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { Fund } from '../entity/fund.entity'
import { User } from '../../users/user.entity'
import { BaseEntity } from '../../../common/base.entity'
import { FundMemberRole } from '../enums/fund-member-role.enum'

@Entity('fund_members')
@Unique(['fundId', 'userId'])
export class FundMember extends BaseEntity {

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid', description: 'Fund ID' })
  @Column({ type: 'uuid' })
  fundId!: string

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid', description: 'User ID' })
  @Column({ type: 'uuid' })
  userId!: string

  @ApiProperty({ enum: FundMemberRole, example: FundMemberRole.MEMBER, description: 'Member role in the fund' })
  @Column({ type: 'enum', enum: FundMemberRole, default: FundMemberRole.MEMBER })
  role!: FundMemberRole

  @ApiPropertyOptional({ type: () => Fund, description: 'Associated fund' })
  @ManyToOne(() => Fund, (fund) => fund.memberships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fundId' })
  fund!: Fund

  @ApiPropertyOptional({ type: () => User, description: 'Associated user' })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User

}
