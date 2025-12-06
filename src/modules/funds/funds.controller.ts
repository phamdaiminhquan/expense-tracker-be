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
import { FundsService } from './funds.service'
import { CreateFundDto } from './dto/create-fund.dto'
import { UpdateFundDto } from './dto/update-fund.dto'
import { AddFundMemberDto } from './dto/add-member.dto'

@ApiTags('funds')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard)
@Controller('funds')
export class FundsController {
  constructor(private readonly fundsService: FundsService) {}

  @Get()
  async list(@CurrentUser() user: JwtPayload) {
    return this.fundsService.findAllForUser(user.sub)
  }

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() body: CreateFundDto) {
    return this.fundsService.create(user.sub, body)
  }

  @Get(':fundId')
  async detail(@CurrentUser() user: JwtPayload, @Param('fundId') fundId: string) {
    await this.fundsService.assertMembership(fundId, user.sub)
    return this.fundsService.findByIdOrThrow(fundId)
  }

  @Patch(':fundId')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
    @Body() body: UpdateFundDto,
  ) {
    return this.fundsService.update(fundId, user.sub, body)
  }

  @Delete(':fundId')
  async delete(@CurrentUser() user: JwtPayload, @Param('fundId') fundId: string) {
    await this.fundsService.delete(fundId, user.sub)
    return { success: true }
  }

  @Get(':fundId/members')
  async members(@CurrentUser() user: JwtPayload, @Param('fundId') fundId: string) {
    return this.fundsService.getMembers(fundId, user.sub)
  }

  @Post(':fundId/members')
  async addMember(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
    @Body() body: AddFundMemberDto,
  ) {
    return this.fundsService.addMember(fundId, user.sub, body.userId, body.role)
  }

  @Delete(':fundId/members/:userId')
  async removeMember(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
    @Param('userId') memberId: string,
  ) {
    await this.fundsService.removeMember(fundId, user.sub, memberId)
    return { success: true }
  }
}
