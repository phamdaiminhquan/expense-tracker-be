import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Fund } from '../entity/fund.entity'
import { FundLastMessageDto } from './fund-last-message.dto'

export class FundDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid' })
  id!: string

  @ApiProperty({ example: 'Family budget' })
  name!: string

  @ApiProperty({ enum: ['personal', 'shared'], example: 'personal' })
  type!: string

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid' })
  ownerId!: string

  @ApiPropertyOptional({ example: '023433', description: 'Fund share code' })
  numberId?: string | null

  @ApiPropertyOptional({ example: 'Family expense tracking fund' })
  description?: string | null

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: Date

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt!: Date

  @ApiPropertyOptional({ example: true })
  isOpenDialogCate!: boolean

  @ApiPropertyOptional({
    type: () => FundLastMessageDto,
    nullable: true,
    description: 'Last message in this fund (null if fund has no messages)',
  })
  lastMessage?: FundLastMessageDto | null
}

