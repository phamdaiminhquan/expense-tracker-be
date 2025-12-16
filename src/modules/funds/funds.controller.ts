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
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'

import { JwtAccessGuard } from '../auth/guards/jwt-access.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface'
import { FundsService } from './funds.service'
import { CreateFundDto } from './dto/create-fund.dto'
import { UpdateFundDto } from './dto/update-fund.dto'
import { AddFundMemberDto } from './dto/add-member.dto'
import { Fund } from './entity/fund.entity'
import { FundMember } from './entity/fund-member.entity'

@ApiTags('funds')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAccessGuard)
@Controller('funds')
export class FundsController {
  constructor(private readonly fundsService: FundsService) { }

  @Get()
  @ApiOperation({ summary: 'List all funds', description: 'Get all funds the current user is a member of' })
  @ApiResponse({ status: 200, description: 'List of funds', type: [Fund] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async list(@CurrentUser() user: JwtPayload) {
    return this.fundsService.findAllForUser(user.sub)
  }

  @Post()
  @ApiOperation({ summary: 'Create fund', description: 'Create a new personal or shared fund' })
  @ApiResponse({ status: 201, description: 'Fund created successfully', type: Fund })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@CurrentUser() user: JwtPayload, @Body() body: CreateFundDto) {
    return this.fundsService.create(user.sub, body)
  }

  @Get(':fundId')
  @ApiOperation({ summary: 'Get fund details', description: 'Get details of a specific fund' })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiResponse({ status: 200, description: 'Fund details', type: Fund })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a member of this fund' })
  @ApiResponse({ status: 404, description: 'Fund not found' })
  async detail(@CurrentUser() user: JwtPayload, @Param('fundId') fundId: string) {
    await this.fundsService.assertMembership(fundId, user.sub)
    return this.fundsService.findByIdOrThrow(fundId)
  }

  @Patch(':fundId')
  @ApiOperation({ summary: 'Update fund', description: 'Update fund details (owner only)' })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiResponse({ status: 200, description: 'Fund updated successfully', type: Fund })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Only owner can update fund' })
  @ApiResponse({ status: 404, description: 'Fund not found' })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
    @Body() body: UpdateFundDto,
  ) {
    return this.fundsService.update(fundId, user.sub, body)
  }

  @Delete(':fundId')
  @ApiOperation({ summary: 'Delete fund', description: 'Delete a fund (owner only)' })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiResponse({ status: 200, description: 'Fund deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Only owner can delete fund' })
  @ApiResponse({ status: 404, description: 'Fund not found' })
  async delete(@CurrentUser() user: JwtPayload, @Param('fundId') fundId: string) {
    await this.fundsService.delete(fundId, user.sub)
    return { success: true }
  }

  @Get(':fundId/members')
  @ApiOperation({ summary: 'List fund members', description: 'Get all members of a fund' })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiResponse({ status: 200, description: 'List of fund members', type: [FundMember] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a member of this fund' })
  async members(@CurrentUser() user: JwtPayload, @Param('fundId') fundId: string) {
    return this.fundsService.getMembers(fundId, user.sub)
  }

  @Post(':fundId/members')
  @ApiOperation({ summary: 'Add fund member', description: 'Add a new member to the fund (owner only)' })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiResponse({ status: 201, description: 'Member added successfully', type: FundMember })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Only owner can add members' })
  @ApiResponse({ status: 404, description: 'Fund or user not found' })
  async addMember(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
    @Body() body: AddFundMemberDto,
  ) {
    return this.fundsService.addMember(fundId, user.sub, body.userId, body.role)
  }

  @Delete(':fundId/members/:userId')
  @ApiOperation({ summary: 'Remove fund member', description: 'Remove a member from the fund (owner only)' })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiParam({ name: 'userId', type: 'string', format: 'uuid', description: 'User ID to remove' })
  @ApiResponse({ status: 200, description: 'Member removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Only owner can remove members' })
  @ApiResponse({ status: 404, description: 'Fund or member not found' })
  async removeMember(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
    @Param('userId') memberId: string,
  ) {
    await this.fundsService.removeMember(fundId, user.sub, memberId)
    return { success: true }
  }
}
