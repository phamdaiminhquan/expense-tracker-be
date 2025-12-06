import { Type } from 'class-transformer'
import { IsOptional, IsString, MaxLength, IsNumber, ValidateIf, IsUUID } from 'class-validator'

export class CreateTransactionDto {
  @IsString()
  @MaxLength(500)
  rawPrompt!: string

  @ValidateIf((o) => o.spendValue !== undefined)
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  spendValue?: number | null

  @ValidateIf((o) => o.earnValue !== undefined)
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  earnValue?: number | null

  @IsString()
  @IsOptional()
  @MaxLength(255)
  content?: string

  @ValidateIf((o) => o.categoryId !== undefined && o.categoryId !== null)
  @IsUUID()
  categoryId?: string | null
}
