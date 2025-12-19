import { IsArray, IsEnum, IsString, IsUUID, MaxLength, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

import { ApiPropertyOptionalCustom } from '../../../common/swagger/api-property-optional-custom.decorator'
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

  @ApiPropertyOptionalCustom({ type: 'string', format: 'uuid', isArray: true })
  @IsArray()
  @IsUUID('all', { each: true })
  memberIds?: string[]
}
