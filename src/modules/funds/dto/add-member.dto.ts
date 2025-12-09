import { IsEnum, IsUUID } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

import { FundMemberRole } from '../enums/fund-member-role.enum'

export class AddFundMemberDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  userId!: string

  @ApiProperty({ enum: FundMemberRole, example: FundMemberRole.MEMBER })
  @IsEnum(FundMemberRole)
  role!: FundMemberRole
}
