import { ApiProperty } from '@nestjs/swagger'

export class FundStatisticsResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid', description: 'Fund ID' })
  fundId!: string

  @ApiProperty({ example: 150000, description: 'Total spending amount (in VND)' })
  totalSpend!: number

  @ApiProperty({ example: 500000, description: 'Total earning amount (in VND)' })
  totalEarn!: number

  @ApiProperty({ example: 350000, description: 'Net balance (totalEarn - totalSpend)' })
  net!: number
}

