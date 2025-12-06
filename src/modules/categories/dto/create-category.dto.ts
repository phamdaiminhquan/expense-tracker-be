import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator'

export class CreateCategoryDto {
  @IsUUID()
  fundId!: string

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string
}
