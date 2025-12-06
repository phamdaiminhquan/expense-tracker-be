import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AiRequestLog } from './ai-request-log.entity'
import { ModelService } from './model.service'
import { Category } from '../categories/category.entity'

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([AiRequestLog, Category]),
  ],
  providers: [ModelService],
  exports: [ModelService],
})
export class AiModule {}
