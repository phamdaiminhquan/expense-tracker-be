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

import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface'
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard'
import { CreatemessageDto } from './dto/create-message.dto'
import { UpdatemessageDto } from './dto/update-message.dto'
import { UsersService } from '../users/users.service'
import { MessagesService } from './messages.service'
import { Message } from './message.entity'

@ApiTags('messages')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAccessGuard)
@Controller()
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
  ) {}

  @Get('funds/:fundId/messages')
  @ApiOperation({
    summary: 'List messages',
    description: 'Get all messages/transactions for a fund. Messages are processed by AI to extract expense data.',
  })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiResponse({ status: 200, description: 'List of messages', type: [Message] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a member of this fund' })
  async listByFund(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
  ) {
    return this.messagesService.listByFund(fundId, user.sub)
  }

  @Post('funds/:fundId/messages')
  @ApiOperation({
    summary: 'Create message',
    description: 'Create a new message/transaction. The message will be processed by AI to extract spend/earn values and category.',
  })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiResponse({ status: 201, description: 'Message created successfully. AI processing completed synchronously.', type: Message })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a member of this fund' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
    @Body() body: CreatemessageDto,
  ) {
    const dbUser = await this.usersService.findById(user.sub)
    return this.messagesService.create(dbUser, fundId, body)
  }

  @Get('messages/:messageId')
  @ApiOperation({ summary: 'Get message details', description: 'Get details of a specific message/transaction' })
  @ApiParam({ name: 'messageId', type: 'string', format: 'uuid', description: 'Message ID' })
  @ApiResponse({ status: 200, description: 'Message details', type: Message })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a member of the fund' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async detail(
    @CurrentUser() user: JwtPayload,
    @Param('messageId') messageId: string,
  ) {
    return this.messagesService.findByIdForUser(messageId, user.sub)
  }

  @Patch('messages/:messageId')
  @ApiOperation({ summary: 'Update message', description: 'Update an existing message/transaction' })
  @ApiParam({ name: 'messageId', type: 'string', format: 'uuid', description: 'Message ID' })
  @ApiResponse({ status: 200, description: 'Message updated successfully', type: Message })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a member of the fund' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('messageId') messageId: string,
    @Body() body: UpdatemessageDto,
  ) {
    return this.messagesService.update(messageId, user.sub, body)
  }

  @Delete('messages/:messageId')
  @ApiOperation({ summary: 'Delete message', description: 'Delete a message/transaction' })
  @ApiParam({ name: 'messageId', type: 'string', format: 'uuid', description: 'Message ID' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a member of the fund' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param('messageId') messageId: string,
  ) {
    return this.messagesService.remove(messageId, user.sub)
  }
}
