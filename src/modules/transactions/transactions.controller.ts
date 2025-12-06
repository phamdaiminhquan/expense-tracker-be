import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { JwtAccessGuard } from '../auth/guards/jwt-access.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface'
import { TransactionsService } from './transactions.service'
import { CreateTransactionDto } from './dto/create-transaction.dto'
import { UpdateTransactionDto } from './dto/update-transaction.dto'
import { UsersService } from '../users/users.service'

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard)
@Controller()
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly usersService: UsersService,
  ) {}

  @Get('funds/:fundId/transactions')
  async listByFund(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
  ) {
    return this.transactionsService.listByFund(fundId, user.sub)
  }

  @Post('funds/:fundId/transactions')
  async create(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
    @Body() body: CreateTransactionDto,
  ) {
    const dbUser = await this.usersService.findById(user.sub)
    return this.transactionsService.create(user.sub, dbUser.name, fundId, body)
  }

  @Get('transactions/:transactionId')
  async detail(
    @CurrentUser() user: JwtPayload,
    @Param('transactionId') transactionId: string,
  ) {
    return this.transactionsService.findByIdForUser(transactionId, user.sub)
  }

  @Patch('transactions/:transactionId')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('transactionId') transactionId: string,
    @Body() body: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(transactionId, user.sub, body)
  }

  @Delete('transactions/:transactionId')
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param('transactionId') transactionId: string,
  ) {
    return this.transactionsService.remove(transactionId, user.sub)
  }
}
