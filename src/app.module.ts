import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import configuration from './config/configuration'
import { validateEnv } from './config/env.validation'
import { LoggerModule } from './common/logger/logger.module'
import { DatabaseLogger } from './database/database-logger'
import { UsersModule } from './modules/users/users.module'
import { AuthModule } from './modules/auth/auth.module'
import { FundsModule } from './modules/funds/funds.module'
import { CategoriesModule } from './modules/categories/categories.module'
import { MessagesModule } from './modules/messages/messages.module'
import { TransactionsModule } from './modules/transactions/transactions.module'
import { AiModule } from './modules/ai/ai.module'
import { StatisticsModule } from './modules/statistics/statistics.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.develop', '.env.local', '.env'],
      load: [configuration],
      validate: validateEnv,
    }),
    LoggerModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres' as const,
        url: configService.getOrThrow<string>('database.url'),
        autoLoadEntities: true,
        synchronize: true,
        logging: configService.get<boolean>('database.logging', false),
        logger: new DatabaseLogger(),
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
    UsersModule,
    AuthModule,
    FundsModule,
    CategoriesModule,
    MessagesModule,
    TransactionsModule,
    AiModule,
    StatisticsModule,
  ],
})
export class AppModule {}
