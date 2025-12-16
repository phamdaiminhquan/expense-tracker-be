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

import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface'
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard'
import { CreatemessageDto } from './dto/create-message.dto'
import { UpdatemessageDto } from './dto/update-message.dto'
import { UsersService } from '../users/users.service'
import { MessagesService } from './messages.service'

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard)
@Controller()
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
  ) {}

  @Get('funds/:fundId/messages')
  async listByFund(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
  ) {
    return this.messagesService.listByFund(fundId, user.sub)
  }

  @Post('funds/:fundId/messages')
  async create(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
    @Body() body: CreatemessageDto,
  ) {
    const dbUser = await this.usersService.findById(user.sub)
    return this.messagesService.create(dbUser, fundId, body)
  }

  @Get('messages/:messageId')
  async detail(
    @CurrentUser() user: JwtPayload,
    @Param('messageId') messageId: string,
  ) {
    return this.messagesService.findByIdForUser(messageId, user.sub)
  }

  @Patch('messages/:messageId')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('messageId') messageId: string,
    @Body() body: UpdatemessageDto,
  ) {
    return this.messagesService.update(messageId, user.sub, body)
  }

  @Delete('messages/:messageId')
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param('messageId') messageId: string,
  ) {
    return this.messagesService.remove(messageId, user.sub)
  }
}
