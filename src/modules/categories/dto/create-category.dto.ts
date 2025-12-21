import { IsString, IsUUID, MaxLength, MinLength, IsOptional } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

import { ApiPropertyOptionalCustom } from '../../../common/swagger/api-property-optional-custom.decorator'

export class CreateCategoryDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  fundId!: string

  @ApiProperty({ example: 'Food & Drinks' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string

  @ApiPropertyOptionalCustom({ example: 'Groceries, eating out...' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  description?: string

  @ApiPropertyOptionalCustom({ format: 'uuid', description: 'Parent category ID (for hierarchical structure). If provided, creates a child category.' })
  @IsUUID()
  @IsOptional()
  parentId?: string
}
