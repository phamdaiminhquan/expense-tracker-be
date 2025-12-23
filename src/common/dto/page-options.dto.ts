import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export enum OrderType {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PageOptionsDto {
  @ApiPropertyOptional({
    enum: OrderType,
    default: OrderType.DESC,
    description: 'Sort order: ASC or DESC',
  })
  @IsEnum(OrderType)
  @IsOptional()
  orderType?: OrderType = OrderType.DESC

  @ApiPropertyOptional({
    default: 'lastActivityTime',
    description: 'Field to sort by. For funds: "lastActivityTime" (COALESCE(lastMessage.timestamp, updatedAt))',
  })
  @IsString()
  @IsOptional()
  orderBy?: string = 'lastActivityTime'

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
    description: 'Page number (1-based)',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 10,
    description: 'Number of items per page',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  take?: number = 10

  @ApiPropertyOptional({
    description: 'Search query string',
  })
  @IsString()
  @IsOptional()
  search?: string

  get skip(): number {
    return (this.page! - 1) * this.take!
  }
}

