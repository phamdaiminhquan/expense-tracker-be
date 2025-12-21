import { IsEnum, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

import { JoinRequestStatus } from '../entity/fund-join-request.entity'

export class GetJoinRequestsQueryDto {
  @ApiPropertyOptional({ 
    enum: JoinRequestStatus, 
    example: JoinRequestStatus.PENDING,
    description: 'Filter join requests by status. If not provided, returns all requests.' 
  })
  @IsOptional()
  @IsEnum(JoinRequestStatus)
  status?: JoinRequestStatus
}

