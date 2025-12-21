import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { Fund } from './fund.entity'
import { User } from '../../users/user.entity'
import { BaseEntity } from '../../../common/base.entity'

export enum JoinRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('fund_join_requests')
@Unique(['fundId', 'userId'])
export class FundJoinRequest extends BaseEntity {

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid', description: 'Fund ID' })
  @Column({ type: 'uuid' })
  fundId!: string

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid', description: 'User ID requesting to join' })
  @Column({ type: 'uuid' })
  userId!: string

  @ApiProperty({ enum: JoinRequestStatus, example: JoinRequestStatus.PENDING, description: 'Status of the join request' })
  @Column({ type: 'enum', enum: JoinRequestStatus, default: JoinRequestStatus.PENDING })
  status!: JoinRequestStatus

  @ApiPropertyOptional({ type: () => Fund, description: 'Associated fund' })
  @ManyToOne(() => Fund, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fundId' })
  fund!: Fund

  @ApiPropertyOptional({ type: () => User, description: 'User requesting to join' })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User

}

