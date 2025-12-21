import { IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

import { FundMemberRole } from '../enums/fund-member-role.enum'

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: FundMemberRole, example: FundMemberRole.MEMBER, description: 'New role for the member' })
  @IsEnum(FundMemberRole)
  role!: FundMemberRole
}

