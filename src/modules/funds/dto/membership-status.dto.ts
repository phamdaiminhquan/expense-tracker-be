import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { FundMemberRole } from '../enums/fund-member-role.enum'
import { JoinRequestStatus } from '../entity/fund-join-request.entity'

export class MembershipStatusDto {
  @ApiProperty({ example: true, description: 'Whether the user is a member of the fund' })
  isMember!: boolean

  @ApiPropertyOptional({ enum: FundMemberRole, description: 'User role in the fund (if member)' })
  role!: FundMemberRole | null

  @ApiPropertyOptional({
    description: 'Join request information (if exists)',
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      status: { enum: Object.values(JoinRequestStatus) },
      createdAt: { type: 'string', format: 'date-time' },
      reviewedAt: { type: 'string', format: 'date-time', nullable: true },
    },
  })
  joinRequest!: {
    id: string
    status: JoinRequestStatus
    createdAt: Date
    reviewedAt: Date | null
  } | null
}

