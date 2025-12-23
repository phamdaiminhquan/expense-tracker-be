import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class FundLastMessageDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid' })
  id!: string

  @ApiProperty({ example: 'Mua đồ ăn trưa 45k', description: 'Original user message (prompt)' })
  message!: string | null

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Message timestamp (used for sorting)' })
  createdAt!: Date

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z', description: 'When AI processing completed' })
  processedAt?: Date | null
}

