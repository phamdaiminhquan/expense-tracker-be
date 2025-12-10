import { Type } from 'class-transformer'
import { IsOptional, IsString, MaxLength, IsNumber, ValidateIf, IsUUID } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateTransactionDto {
  @ApiProperty({ example: 'Mua đồ ăn trưa 45k' })
  @IsString()
  @MaxLength(500)
  rawPrompt!: string

  @ApiPropertyOptional({ type: 'number', format: 'float', example: 45 })
  @IsOptional()
  @ValidateIf((o) => o.spendValue !== undefined)
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  spendValue?: number | null

  @ApiPropertyOptional({ type: 'number', format: 'float', example: 10 })
  @IsOptional()
  @ValidateIf((o) => o.earnValue !== undefined)
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  earnValue?: number | null

  @ApiPropertyOptional({ example: 'Ăn trưa với team' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  content?: string

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @ValidateIf((o) => o.categoryId !== undefined && o.categoryId !== null)
  @IsUUID()
  categoryId?: string | null
}
