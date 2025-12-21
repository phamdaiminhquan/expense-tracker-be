import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
import { UpdateMemberRoleDto } from './dto/update-member-role.dto'
import { MembershipStatusDto } from './dto/membership-status.dto'
import { PublicFundInfoDto } from './dto/public-fund-info.dto'
import { GetJoinRequestsQueryDto } from './dto/get-join-requests-query.dto'
import { JoinRequestListItemDto } from './dto/join-request-list-item.dto'
import { Fund } from './entity/fund.entity'
import { FundMember } from './entity/fund-member.entity'
import { FundJoinRequest, JoinRequestStatus } from './entity/fund-join-request.entity'

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

  @Get('lookup')
  @ApiOperation({ 
    summary: 'Lookup fund by numberId (query param)', 
    description: 'Alternative endpoint to search fund by numberId using query parameter. Returns minimal public information only.' 
  })
  @ApiResponse({ status: 200, description: 'Public fund information', type: PublicFundInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Fund not found' })
  async lookupByNumberId(@Query('numberId') numberId: string) {
    const fund = await this.fundsService.findByNumberId(numberId)
    return this.fundsService.getPublicFundInfo(fund.id)
  }

  @Get('search/:numberId')
  @ApiOperation({ 
    summary: 'Search fund by numberId', 
    description: 'Search for a fund by its share code (numberId). Returns minimal public information only. Funds are PRIVATE and can only be found by exact code match.' 
  })
  @ApiParam({ name: 'numberId', type: 'string', description: 'Fund share code (6-digit number)', example: '023433' })
  @ApiResponse({ status: 200, description: 'Public fund information', type: PublicFundInfoDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Fund not found' })
  async searchByNumberId(@Param('numberId') numberId: string) {
    const fund = await this.fundsService.findByNumberId(numberId)
    return this.fundsService.getPublicFundInfo(fund.id)
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

  @Get(':fundId/membership')
  @ApiOperation({ 
    summary: 'Get membership status', 
    description: 'Get the current user\'s membership status and role in a fund' 
  })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiResponse({ status: 200, description: 'Membership status', type: MembershipStatusDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Fund not found' })
  async getMembershipStatus(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
  ) {
    return this.fundsService.getMembershipStatus(fundId, user.sub)
  }

  @Post(':fundId/join-requests')
  @ApiOperation({ 
    summary: 'Request to join fund', 
    description: 'Send a join request to a fund. The request will be pending until approved by the fund owner or admin. Idempotent: returns existing request if already exists.' 
  })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiResponse({ status: 201, description: 'Join request created successfully', type: FundJoinRequest })
  @ApiResponse({ status: 400, description: 'Already a member or invalid request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Fund not found' })
  async createJoinRequest(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
  ) {
    return this.fundsService.createJoinRequest(fundId, user.sub)
  }

  @Get(':fundId/join-requests')
  @ApiOperation({ 
    summary: 'List join requests', 
    description: 'Get all join requests for a fund. Only owners and admins can view. Optional status filter.' 
  })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiResponse({ status: 200, description: 'List of join requests', type: [JoinRequestListItemDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Only owners and admins can view join requests' })
  @ApiResponse({ status: 404, description: 'Fund not found' })
  async getJoinRequests(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
    @Query() query: GetJoinRequestsQueryDto,
  ) {
    return this.fundsService.getJoinRequests(fundId, user.sub, query.status)
  }

  @Post(':fundId/join-requests/:requestId/approve')
  @ApiOperation({ 
    summary: 'Approve join request', 
    description: 'Approve a pending join request. The user will become a member with MEMBER role. Only owners and admins can approve.' 
  })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiParam({ name: 'requestId', type: 'string', format: 'uuid', description: 'Join request ID' })
  @ApiResponse({ status: 200, description: 'Join request approved successfully', type: FundJoinRequest })
  @ApiResponse({ status: 400, description: 'Request is not in PENDING status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Only owners and admins can approve requests' })
  @ApiResponse({ status: 404, description: 'Fund or join request not found' })
  async approveJoinRequest(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
    @Param('requestId') requestId: string,
  ) {
    return this.fundsService.approveJoinRequest(fundId, requestId, user.sub)
  }

  @Post(':fundId/join-requests/:requestId/reject')
  @ApiOperation({ 
    summary: 'Reject join request', 
    description: 'Reject a pending join request. Only owners and admins can reject.' 
  })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiParam({ name: 'requestId', type: 'string', format: 'uuid', description: 'Join request ID' })
  @ApiResponse({ status: 200, description: 'Join request rejected successfully', type: FundJoinRequest })
  @ApiResponse({ status: 400, description: 'Request is not in PENDING status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Only owners and admins can reject requests' })
  @ApiResponse({ status: 404, description: 'Fund or join request not found' })
  async rejectJoinRequest(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
    @Param('requestId') requestId: string,
  ) {
    return this.fundsService.rejectJoinRequest(fundId, requestId, user.sub)
  }

  @Patch(':fundId/members/:memberId/role')
  @ApiOperation({ 
    summary: 'Update member role', 
    description: 'Update a member\'s role in the fund. Only owners and admins can update roles. Owners can assign any role, admins cannot assign owner role.' 
  })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiParam({ name: 'memberId', type: 'string', format: 'uuid', description: 'Fund member ID' })
  @ApiResponse({ status: 200, description: 'Member role updated successfully', type: FundMember })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Only owners and admins can update roles' })
  @ApiResponse({ status: 404, description: 'Fund or member not found' })
  async updateMemberRole(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
    @Param('memberId') memberId: string,
    @Body() body: UpdateMemberRoleDto,
  ) {
    return this.fundsService.updateMemberRole(fundId, memberId, body.role, user.sub)
  }
}
