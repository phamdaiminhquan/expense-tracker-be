import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger'

import { JwtAccessGuard } from '../auth/guards/jwt-access.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface'
import { StatisticsService } from './statistics.service'
import { FundStatisticsResponseDto } from './dto/statistics-response.dto'

@ApiTags('statistics')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAccessGuard)
@Controller('funds/:fundId/statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get fund statistics',
    description: 'Get spending and earning summary for a fund. Optionally filter by date range.',
  })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiQuery({
    name: 'from',
    required: false,
    type: 'string',
    format: 'date-time',
    description: 'Start date for filtering (ISO 8601 format)',
    example: '2024-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    type: 'string',
    format: 'date-time',
    description: 'End date for filtering (ISO 8601 format)',
    example: '2024-12-31T23:59:59Z',
  })
  @ApiResponse({ status: 200, description: 'Fund statistics summary', type: FundStatisticsResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a member of this fund' })
  async summary(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate = from ? this.parseDate(from) : undefined
    const toDate = to ? this.parseDate(to) : undefined
    return this.statisticsService.fundSummary(fundId, user.sub, { from: fromDate, to: toDate })
  }

  private parseDate(value: string | undefined): Date | undefined {
    if (!value) {
      return undefined
    }
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  }
}
