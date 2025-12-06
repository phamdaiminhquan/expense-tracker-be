import { IsArray, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator'

import { FundType } from '../fund.entity'

export class CreateFundDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string

  @IsEnum(['personal', 'shared'])
  type!: FundType

  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  memberIds?: string[]
}
