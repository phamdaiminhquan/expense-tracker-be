import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BullModule } from '@nestjs/bullmq'

import configuration from './config/configuration'
import { validateEnv } from './config/env.validation'
import { LoggerModule } from './common/logger/logger.module'
import { DatabaseLogger } from './database/database-logger'
import { UsersModule } from './modules/users/users.module'
import { AuthModule } from './modules/auth/auth.module'
import { FundsModule } from './modules/funds/funds.module'
import { CategoriesModule } from './modules/categories/categories.module'
import { MessagesModule } from './modules/messages/messages.module'
import { AiModule } from './modules/ai/ai.module'
import { JobsModule } from './modules/jobs/jobs.module'
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
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          url: configService.getOrThrow<string>('redis.url'),
        },
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: 100,
        },
      }),
    }),
    UsersModule,
    AuthModule,
    FundsModule,
    CategoriesModule,
    MessagesModule,
    AiModule,
    JobsModule,
    StatisticsModule,
  ],
})
export class AppModule {}
