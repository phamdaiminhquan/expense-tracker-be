import { Module, forwardRef } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AiRequestLog } from './ai-request-log.entity'
import { ModelService } from './model.service'
import { CategoriesModule } from '../categories/categories.module'

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([AiRequestLog]),
    forwardRef(() => CategoriesModule),
  ],
  providers: [ModelService],
  exports: [ModelService],
})
export class AiModule {}
