import { IsArray, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { FundType } from '../enums/fund-type.enum'

export class CreateFundDto {
  @ApiProperty({ example: 'Family budget' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string

  @ApiProperty({ enum: FundType, example: FundType.PERSONAL })
  @IsEnum(FundType)
  type!: FundType

  @ApiPropertyOptional({ type: 'string', format: 'uuid', isArray: true })
  @IsArray()
  @IsUUID('all', { each: true })
  @IsOptional()
  memberIds?: string[]
}
