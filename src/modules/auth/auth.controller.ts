import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'

import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { UsersService } from '../users/users.service'
import { RegisterDto } from './dto/register.dto'
import { AuthResponseDto } from './dto/auth-response.dto'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate a user with email and password. Returns access and refresh tokens.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns tokens and user info.',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password)
    return this.authService.login(user)
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Exchange a valid refresh token for new access and refresh tokens.',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token refresh successful. Returns new tokens and user info.',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body() body: RefreshTokenDto) {
    const payload = await this.authService.verifyRefreshToken(body.refreshToken)
    const user = await this.usersService.findById(payload.sub)
    return this.authService.login(user)
  }

  @Post('register')
  @ApiOperation({
    summary: 'Register new user',
    description: 'Create a new user account and return authentication tokens.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Registration successful. Returns tokens and user info.',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(@Body() body: RegisterDto) {
    const user = await this.authService.register(body)
    return this.authService.login(user)
  }
}
