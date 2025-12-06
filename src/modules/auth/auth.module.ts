import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule, JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { UsersModule } from '../users/users.module'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtAccessStrategy } from './strategies/jwt-access.strategy'
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy'

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<JwtModuleOptions> => {
        const accessSecret = configService.get<string>('auth.accessSecret')
        if (!accessSecret) {
          throw new Error('Missing auth.accessSecret configuration')
        }

        const expiresInConfig = configService.get<string | number>('auth.accessExpiresIn')
        const expiresIn = (expiresInConfig ?? '15m') as JwtSignOptions['expiresIn']

        return {
          secret: accessSecret,
          signOptions: {
            expiresIn,
          },
        }
      },
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAccessStrategy, JwtRefreshStrategy],
  exports: [AuthService],
})
export class AuthModule {}
