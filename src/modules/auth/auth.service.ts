import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'

import { UsersService } from '../users/users.service'
import { User } from '../users/user.entity'
import { JwtPayload } from './interfaces/jwt-payload.interface'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email, true)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return user
  }

  async login(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    }

    const accessToken = await this.jwtService.signAsync(payload)

    const refreshSecret = this.configService.get<string>('auth.refreshSecret')
    if (!refreshSecret) {
      throw new Error('Missing auth.refreshSecret configuration')
    }

    const refreshExpiresInConfig = this.configService.get<string | number>('auth.refreshExpiresIn')
    const refreshExpiresIn = (refreshExpiresInConfig ?? '7d') as JwtSignOptions['expiresIn']

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    })

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    }
  }

  async verifyRefreshToken(token: string) {
    try {
      const refreshSecret = this.configService.get<string>('auth.refreshSecret')
      if (!refreshSecret) {
        throw new Error('Missing auth.refreshSecret configuration')
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: refreshSecret,
      })
      return payload
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async register(dto: RegisterDto): Promise<User> {
    const existing = await this.usersService.findByEmail(dto.email)
    if (existing) {
      throw new ConflictException('Email already registered')
    }

    const passwordHash = await bcrypt.hash(dto.password, 10)
    const user = await this.usersService.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
    })

    return user
  }
}
