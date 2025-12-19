import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Category } from './category.entity'
import { FundCategory } from './fund-category.entity'
import { CategoriesService } from './categories.service'
import { CategoriesController } from './categories.controller'
import { FundsModule } from '../funds/funds.module'

@Module({
  imports: [TypeOrmModule.forFeature([Category, FundCategory]), forwardRef(() => FundsModule)],
  providers: [CategoriesService],
  controllers: [CategoriesController],
  exports: [CategoriesService],
})
export class CategoriesModule {}
