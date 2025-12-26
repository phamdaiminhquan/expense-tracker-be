import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Not, In, Repository } from 'typeorm'

import { Category } from './category.entity'
import { FundCategory } from './fund-category.entity'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { FundsService } from '../funds/funds.service'

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(FundCategory)
    private readonly fundCategoryRepository: Repository<FundCategory>,
    @Inject(forwardRef(() => FundsService))
    private readonly fundsService: FundsService,
  ) {}

  /**
   * Initialize default categories for a fund
   * This method no longer creates categories - they should already exist in DB
   * Categories are created via migration script
   * This method is kept for backward compatibility but does nothing
   * Users will subscribe to categories manually
   */
  async initializeDefaultCategoriesForFund(fundId: string): Promise<void> {
    // Default categories should already exist in database (created via migration)
    // Do NOT create FundCategory entries - users will subscribe manually
    // This method is a no-op for backward compatibility
  }

  /**
   * List categories for a fund (both default and custom, only active ones)
   */
  async listByFund(fundId: string, userId: string) {
    await this.fundsService.assertMembership(fundId, userId)
    return this.getActiveCategoriesForFund(fundId)
  }

  /**
   * Get active categories for a fund (without membership check)
   * Only returns subscribed child categories (not parent categories)
   * Custom categories are prioritized over default categories when they have the same name
   * Used internally by services that already verified membership
   */
  async getActiveCategoriesForFund(fundId: string): Promise<Category[]> {
    // Get all active fund-category relationships
    const fundCategories = await this.fundCategoryRepository.find({
      where: { fundId, isActive: true },
      relations: ['category', 'category.parent'],
    })

    // Filter to only return child categories (categories with a parent)
    const subscribedCategories = fundCategories.map((fc) => fc.category)
    const childCategories = subscribedCategories.filter(cat => cat.parentId !== null)
    
    // Sort: custom categories (isDefault = false) come FIRST, then default categories (isDefault = true)
    // This ensures AI sees custom categories first and prioritizes them when matching
    // Within each group, sort by name for consistency
    return childCategories.sort((a, b) => {
      // Priority 1: Custom categories (isDefault = false) before default categories (isDefault = true)
      if (a.isDefault !== b.isDefault) {
        return a.isDefault ? 1 : -1
      }
      // Priority 2: Sort by name alphabetically within same type
      return a.name.localeCompare(b.name)
    })
  }

  /**
   * Create a custom category for a fund
   * Can create both parent and child categories (child if parentId is provided)
   * Custom categories are only for the specific fund
   */
  async create(userId: string, dto: CreateCategoryDto) {
    await this.fundsService.assertMembership(dto.fundId, userId)

    // If parentId is provided, validate it belongs to this fund
    if (dto.parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: dto.parentId },
      })
      
      if (!parent) {
        throw new NotFoundException('Parent category not found')
      }
      
      // Parent must be a custom category of this fund (not default)
      if (parent.isDefault || parent.fundId !== dto.fundId) {
        throw new Error('Parent category must be a custom category of this fund')
      }
    }

    // Check if category with same name already exists for this fund at the same level
    const existing = await this.categoryRepository.findOne({
      where: { 
        name: dto.name, 
        fundId: dto.fundId, 
        isDefault: false,
        parentId: dto.parentId || IsNull(),
      },
    })

    if (existing) {
      throw new Error('Category with this name already exists for this fund at this level')
    }

    const category = this.categoryRepository.create({
      ...dto,
      isDefault: false,
    })

    const savedCategory = await this.categoryRepository.save(category)

    // Auto-subscribe custom categories (only child categories are usable for transactions)
    // If it's a parent category, don't subscribe (users will subscribe its children)
    if (dto.parentId) {
      const fundCategory = this.fundCategoryRepository.create({
        fundId: dto.fundId,
        categoryId: savedCategory.id,
        isActive: true,
      })
      await this.fundCategoryRepository.save(fundCategory)
    }

    return savedCategory
  }

  /**
   * Update a category (only custom categories can be updated)
   */
  async update(categoryId: string, userId: string, dto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({ where: { id: categoryId } })
    if (!category) {
      throw new NotFoundException('Category not found')
    }

    if (category.isDefault) {
      throw new Error('Default categories cannot be updated')
    }

    if (category.fundId) {
      await this.fundsService.assertMembership(category.fundId, userId)
    }

    Object.assign(category, dto)
    return this.categoryRepository.save(category)
  }

  /**
   * Remove a category (soft delete for custom, deactivate for default)
   * Requires fundId to be passed for default categories
   */
  async remove(categoryId: string, userId: string, fundId?: string) {
    const category = await this.categoryRepository.findOne({ where: { id: categoryId } })
    if (!category) {
      throw new NotFoundException('Category not found')
    }

    if (category.isDefault) {
      // For default categories, deactivate in the specific fund
      if (!fundId) {
        throw new Error('Fund ID is required to remove a default category')
      }

      await this.fundsService.assertMembership(fundId, userId)

      const fundCategory = await this.fundCategoryRepository.findOne({
        where: { categoryId, fundId },
      })

      if (fundCategory) {
        fundCategory.isActive = false
        await this.fundCategoryRepository.save(fundCategory)
      }

      return { success: true }
    } else {
      // For custom categories, soft delete
      if (category.fundId) {
        await this.fundsService.assertMembership(category.fundId, userId)
      }

      await this.categoryRepository.softDelete({ id: categoryId })
      return { success: true }
    }
  }

  /**
   * Get all available default categories with their hierarchy and subscription status for a fund
   * Returns parent categories with their children, including subscription status
   */
  async listAvailableDefaultCategories(fundId: string, userId: string) {
    await this.fundsService.assertMembership(fundId, userId)
    
    // Get all default categories (parents and children)
    const allDefaultCategories = await this.categoryRepository.find({
      where: { isDefault: true },
      relations: ['parent', 'children'],
      order: { createdAt: 'ASC' },
    })
    
    // Get subscribed categories for this fund
    const subscribedCategories = await this.fundCategoryRepository.find({
      where: { fundId, isActive: true },
      select: ['categoryId'],
    })
    const subscribedCategoryIds = new Set(subscribedCategories.map(fc => fc.categoryId))
    
    // Build hierarchy structure
    const parentCategories = allDefaultCategories.filter(cat => !cat.parentId)
    
    return parentCategories.map(parent => ({
      id: parent.id,
      name: parent.name,
      description: parent.description,
      image: parent.image,
      isDefault: parent.isDefault,
      parentId: parent.parentId,
      isSubscribed: subscribedCategoryIds.has(parent.id),
      children: (parent.children || []).map(child => ({
        id: child.id,
        name: child.name,
        description: child.description,
        image: child.image,
        isDefault: child.isDefault,
        parentId: child.parentId,
        isSubscribed: subscribedCategoryIds.has(child.id),
      })),
    }))
  }

  /**
   * Subscribe a category to a fund (only child categories can be subscribed)
   */
  async subscribeCategory(fundId: string, categoryId: string, userId: string) {
    await this.fundsService.assertMembership(fundId, userId)
    
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      relations: ['parent'],
    })
    
    if (!category) {
      throw new NotFoundException('Category not found')
    }
    
    // Only allow subscribing to child categories (categories with a parent)
    if (!category.parentId) {
      throw new Error('Cannot subscribe to parent category. Only child categories can be subscribed.')
    }
    
    // Check if it's a default category or custom category for this fund
    if (category.isDefault || category.fundId === fundId) {
      let fundCategory = await this.fundCategoryRepository.findOne({
        where: { fundId, categoryId },
      })
      
      if (!fundCategory) {
        fundCategory = this.fundCategoryRepository.create({
          fundId,
          categoryId,
          isActive: true,
        })
      } else {
        fundCategory.isActive = true
      }
      
      return this.fundCategoryRepository.save(fundCategory)
    }
    
    throw new Error('Category does not belong to this fund')
  }

  /**
   * Unsubscribe a category from a fund
   */
  async unsubscribeCategory(fundId: string, categoryId: string, userId: string) {
    await this.fundsService.assertMembership(fundId, userId)
    
    const fundCategory = await this.fundCategoryRepository.findOne({
      where: { fundId, categoryId },
    })
    
    if (!fundCategory) {
      throw new NotFoundException('Category subscription not found')
    }
    
    fundCategory.isActive = false
    return this.fundCategoryRepository.save(fundCategory)
  }

  /**
   * Subscribe all child categories (all default child categories)
   */
  async subscribeAllChildCategories(fundId: string, userId: string) {
    await this.fundsService.assertMembership(fundId, userId)
    
    // Get all default child categories (categories with parentId)
    const allChildCategories = await this.categoryRepository.find({
      where: { isDefault: true, parentId: Not(IsNull()) },
    })
    
    // Get existing subscriptions
    const existingSubscriptions = await this.fundCategoryRepository.find({
      where: { fundId },
      select: ['categoryId'],
    })
    const existingCategoryIds = new Set(existingSubscriptions.map(fc => fc.categoryId))
    
    // Create subscriptions for all child categories that don't exist yet
    const newSubscriptions = allChildCategories
      .filter(cat => !existingCategoryIds.has(cat.id))
      .map(category => 
        this.fundCategoryRepository.create({
          fundId,
          categoryId: category.id,
          isActive: true,
        })
      )
    
    // Activate existing subscriptions that are inactive
    const childCategoryIds = allChildCategories.map(c => c.id)
    const inactiveSubscriptions = childCategoryIds.length > 0 
      ? await this.fundCategoryRepository.find({
          where: { 
            fundId, 
            categoryId: In(childCategoryIds),
            isActive: false,
          },
        })
      : []
    
    for (const sub of inactiveSubscriptions) {
      sub.isActive = true
    }
    
    await this.fundCategoryRepository.save([...newSubscriptions, ...inactiveSubscriptions])
    
    return { success: true, subscribedCount: newSubscriptions.length + inactiveSubscriptions.length }
  }

  /**
   * Subscribe all children of a parent category
   */
  async subscribeAllChildrenOfParent(fundId: string, parentId: string, userId: string) {
    await this.fundsService.assertMembership(fundId, userId)
    
    // Verify parent category exists and is a default parent
    const parent = await this.categoryRepository.findOne({
      where: { id: parentId, isDefault: true, parentId: IsNull() },
    })
    
    if (!parent) {
      throw new NotFoundException('Parent category not found')
    }
    
    // Get all children of this parent
    const children = await this.categoryRepository.find({
      where: { parentId: parentId, isDefault: true },
    })
    
    if (children.length === 0) {
      return { success: true, subscribedCount: 0 }
    }
    
    // Get existing subscriptions
    const childrenIds = children.map(c => c.id)
    const existingSubscriptions = childrenIds.length > 0
      ? await this.fundCategoryRepository.find({
          where: { fundId, categoryId: In(childrenIds) },
        })
      : []
    const existingCategoryIds = new Set(existingSubscriptions.map(fc => fc.categoryId))
    
    // Create new subscriptions
    const newSubscriptions = children
      .filter(cat => !existingCategoryIds.has(cat.id))
      .map(category => 
        this.fundCategoryRepository.create({
          fundId,
          categoryId: category.id,
          isActive: true,
        })
      )
    
    // Activate inactive subscriptions
    for (const sub of existingSubscriptions) {
      if (!sub.isActive) {
        sub.isActive = true
      }
    }
    
    await this.fundCategoryRepository.save([...newSubscriptions, ...existingSubscriptions])
    
    return { success: true, subscribedCount: newSubscriptions.length + existingSubscriptions.length }
  }

  /**
   * Toggle category active status in a fund (for default categories)
   * @deprecated Use subscribeCategory/unsubscribeCategory instead
   */
  async toggleCategoryInFund(fundId: string, categoryId: string, userId: string, isActive: boolean) {
    await this.fundsService.assertMembership(fundId, userId)

    let fundCategory = await this.fundCategoryRepository.findOne({
      where: { fundId, categoryId },
    })

    if (!fundCategory) {
      // Create relationship if it doesn't exist
      fundCategory = this.fundCategoryRepository.create({
        fundId,
        categoryId,
        isActive,
      })
    } else {
      fundCategory.isActive = isActive
    }

    return this.fundCategoryRepository.save(fundCategory)
  }
}
