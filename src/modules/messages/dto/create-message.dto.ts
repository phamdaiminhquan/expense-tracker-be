import { IsString, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreatemessageDto {
  @ApiProperty({ example: 'Mua đồ ăn trưa 45k', description: 'Tin nhắn gốc của người dùng (prompt)' })
  @IsString()
  @MaxLength(500)
  message!: string
}
