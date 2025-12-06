import { IsEnum, IsUUID } from 'class-validator'

import { FundMemberRole } from '../fund-member.entity'

export class AddFundMemberDto {
  @IsUUID()
  userId!: string

  @IsEnum(['owner', 'member'])
  role!: FundMemberRole
}
