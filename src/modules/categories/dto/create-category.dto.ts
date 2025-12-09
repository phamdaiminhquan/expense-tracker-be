import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateCategoryDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  fundId!: string

  @ApiProperty({ example: 'Food & Drinks' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string

  @ApiPropertyOptional({ example: 'Groceries, eating out...' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string
}
