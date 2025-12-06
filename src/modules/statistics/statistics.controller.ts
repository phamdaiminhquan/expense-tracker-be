import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { JwtAccessGuard } from '../auth/guards/jwt-access.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface'
import { StatisticsService } from './statistics.service'

@ApiTags('statistics')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard)
@Controller('funds/:fundId/statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
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
