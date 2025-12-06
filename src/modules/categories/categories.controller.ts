import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { JwtAccessGuard } from '../auth/guards/jwt-access.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface'
import { CategoriesService } from './categories.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard)
@Controller('funds/:fundId/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async list(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
  ) {
    return this.categoriesService.listByFund(fundId, user.sub)
  }

  @Post()
  async create(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
    @Body() body: CreateCategoryDto,
  ) {
    return this.categoriesService.create(user.sub, { ...body, fundId })
  }

  @Patch(':categoryId')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('categoryId') categoryId: string,
    @Body() body: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(categoryId, user.sub, body)
  }

  @Delete(':categoryId')
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param('categoryId') categoryId: string,
  ) {
    return this.categoriesService.remove(categoryId, user.sub)
  }
}
