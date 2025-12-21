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
  @ApiOperation({ summary: 'List subscribed categories', description: 'Get all subscribed (active) categories for a fund' })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiResponse({ status: 200, description: 'List of subscribed categories', type: [Category] })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a member of this fund' })
  async list(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
  ) {
    return this.categoriesService.listByFund(fundId, user.sub)
  }

  @Get('available')
  @ApiOperation({ 
    summary: 'List available default categories', 
    description: 'Get all default categories with hierarchy and subscription status' 
  })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiResponse({ status: 200, description: 'List of available categories with hierarchy' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a member of this fund' })
  async listAvailable(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
  ) {
    return this.categoriesService.listAvailableDefaultCategories(fundId, user.sub)
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

  @Post('subscribe-all')
  @ApiOperation({ 
    summary: 'Subscribe all child categories', 
    description: 'Subscribe all default child categories to this fund' 
  })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiResponse({ status: 200, description: 'All child categories subscribed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a member of this fund' })
  async subscribeAll(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
  ) {
    return this.categoriesService.subscribeAllChildCategories(fundId, user.sub)
  }

  @Post('parent/:parentId/subscribe-all')
  @ApiOperation({ 
    summary: 'Subscribe all children of a parent', 
    description: 'Subscribe all child categories belonging to a parent category' 
  })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiParam({ name: 'parentId', type: 'string', format: 'uuid', description: 'Parent category ID' })
  @ApiResponse({ status: 200, description: 'All children subscribed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a member of this fund' })
  @ApiResponse({ status: 404, description: 'Parent category not found' })
  async subscribeAllChildren(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
    @Param('parentId') parentId: string,
  ) {
    return this.categoriesService.subscribeAllChildrenOfParent(fundId, parentId, user.sub)
  }

  @Post(':categoryId/subscribe')
  @ApiOperation({ 
    summary: 'Subscribe to a category', 
    description: 'Subscribe a child category to this fund (only child categories can be subscribed)' 
  })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiParam({ name: 'categoryId', type: 'string', format: 'uuid', description: 'Category ID (must be a child category)' })
  @ApiResponse({ status: 200, description: 'Category subscribed successfully' })
  @ApiResponse({ status: 400, description: 'Cannot subscribe to parent category' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a member of this fund' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async subscribe(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.categoriesService.subscribeCategory(fundId, categoryId, user.sub)
  }

  @Post(':categoryId/unsubscribe')
  @ApiOperation({ 
    summary: 'Unsubscribe from a category', 
    description: 'Unsubscribe a category from this fund' 
  })
  @ApiParam({ name: 'fundId', type: 'string', format: 'uuid', description: 'Fund ID' })
  @ApiParam({ name: 'categoryId', type: 'string', format: 'uuid', description: 'Category ID' })
  @ApiResponse({ status: 200, description: 'Category unsubscribed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Not a member of this fund' })
  @ApiResponse({ status: 404, description: 'Category subscription not found' })
  async unsubscribe(
    @CurrentUser() user: JwtPayload,
    @Param('fundId') fundId: string,
    @Param('categoryId') categoryId: string,
  ) {
    return this.categoriesService.unsubscribeCategory(fundId, categoryId, user.sub)
  }

  @Patch(':categoryId/toggle')
  @ApiOperation({ summary: 'Toggle category in fund', description: 'Activate or deactivate a category in a fund (deprecated, use subscribe/unsubscribe instead)' })
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
