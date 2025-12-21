import { ApiProperty } from '@nestjs/swagger'

export class PublicFundOwnerDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid' })
  id!: string

  @ApiProperty({ example: 'Nguyen Van A' })
  name!: string
}

export class PublicFundInfoDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid' })
  id!: string

  @ApiProperty({ example: 'Family budget' })
  name!: string

  @ApiProperty({ example: 'Family expense tracking fund', nullable: true })
  description!: string | null

  @ApiProperty({ type: () => PublicFundOwnerDto })
  owner!: PublicFundOwnerDto

  @ApiProperty({ example: 5, description: 'Number of members in the fund' })
  memberCount!: number

  @ApiProperty({ example: '023433', description: 'Fund share code' })
  numberId!: string
}

