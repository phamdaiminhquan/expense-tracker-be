import { ApiProperty } from '@nestjs/swagger'

export class UserResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', format: 'uuid' })
  id!: string

  @ApiProperty({ example: 'user@example.com' })
  email!: string

  @ApiProperty({ example: 'Nguyen Van A' })
  name!: string
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken!: string

  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto
}

