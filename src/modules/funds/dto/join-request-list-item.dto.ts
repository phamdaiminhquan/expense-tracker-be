import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { JoinRequestStatus } from '../entity/fund-join-request.entity'

export class JoinRequestUserDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid' })
  id!: string

  @ApiProperty({ example: 'Nguyen Van A' })
  name!: string

  @ApiProperty({ example: 'user@example.com' })
  email!: string
}

export class JoinRequestListItemDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid' })
  id!: string

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid' })
  fundId!: string

  @ApiProperty({ enum: JoinRequestStatus, example: JoinRequestStatus.PENDING })
  status!: JoinRequestStatus

  @ApiProperty({ type: () => JoinRequestUserDto })
  user!: JoinRequestUserDto

  @ApiProperty({ example: '2024-01-15T10:30:00Z', format: 'date-time' })
  createdAt!: Date

  @ApiPropertyOptional({ example: '2024-01-15T10:35:00Z', format: 'date-time' })
  reviewedAt?: Date | null

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid' })
  reviewedById?: string | null
}

