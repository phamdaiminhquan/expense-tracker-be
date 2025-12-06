import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { UsersService } from '../users/users.service'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password)
    return this.authService.login(user)
  }

  @Post('refresh')
  async refresh(@Body() body: RefreshTokenDto) {
    const payload = await this.authService.verifyRefreshToken(body.refreshToken)
    const user = await this.usersService.findById(payload.sub)
    return this.authService.login(user)
  }
}
