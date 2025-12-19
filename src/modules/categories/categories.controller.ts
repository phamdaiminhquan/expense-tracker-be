import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'

import { JwtAccessGuard } from '../auth/guards/jwt-access.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface'
import { CategoriesService } from './categories.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { Category } from './category.entity'

@ApiTags('categories')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAccessGuard)
@Controller('funds/:fundId/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List categories', description: 'Get all categories for a fund' })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiResponse({ status: 200, description: 'List of categories', type: [Category] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a member of this fund' })
  async list(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
  ) {
    return this.categoriesService.listByFund(fundId, user.sub)
  }

  @Post()
  @ApiOperation({ summary: 'Create category', description: 'Create a new category for a fund' })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiResponse({ status: 201, description: 'Category created successfully', type: Category })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a member of this fund' })
  @ApiResponse({ status: 409, description: 'Category with this name already exists' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
    @Body() body: CreateCategoryDto,
  ) {
    return this.categoriesService.create(user.sub, { ...body, fundId })
  }

  @Patch(':categoryId')
  @ApiOperation({ summary: 'Update category', description: 'Update an existing category' })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiParam({ name: 'categoryId', type: 'string', format: 'uuid', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category updated successfully', type: Category })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a member of this fund' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('categoryId') categoryId: string,
    @Body() body: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(categoryId, user.sub, body)
  }

  @Delete(':categoryId')
  @ApiOperation({ summary: 'Delete category', description: 'Delete a category (deactivate for default, soft delete for custom)' })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiParam({ name: 'categoryId', type: 'string', format: 'uuid', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a member of this fund' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.categoriesService.remove(categoryId, user.sub, fundId)
  }

  @Patch(':categoryId/toggle')
  @ApiOperation({ summary: 'Toggle category in fund', description: 'Activate or deactivate a category in a fund (for default categories)' })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiParam({ name: 'categoryId', type: 'string', format: 'uuid', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category toggled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a member of this fund' })
  async toggle(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
    @Param('categoryId') categoryId: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.categoriesService.toggleCategoryInFund(fundId, categoryId, user.sub, body.isActive)
  }
}
