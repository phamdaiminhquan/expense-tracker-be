import { Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { IsNull, Repository } from 'typeorm'

import { Category } from './category.entity'
import { FundCategory } from './fund-category.entity'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { FundsService } from '../funds/funds.service'
import { DEFAULT_CATEGORIES } from './default-categories'

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
   * This creates default categories and links them to the fund
   */
  async initializeDefaultCategoriesForFund(fundId: string): Promise<void> {
    // Create or get default categories
    const defaultCategories = await this.ensureDefaultCategoriesExist()

    // Link all default categories to the fund
    const fundCategories = defaultCategories.map((category) =>
      this.fundCategoryRepository.create({
        fundId,
        categoryId: category.id,
        isActive: true,
      }),
    )

    await this.fundCategoryRepository.save(fundCategories)
  }

  /**
   * Ensure default categories exist in database
   * Returns all default categories (parents and children)
   */
  private async ensureDefaultCategoriesExist(): Promise<Category[]> {
    const allCategories: Category[] = []

    for (const parentDef of DEFAULT_CATEGORIES) {
      // Find or create parent category
      let parent = await this.categoryRepository.findOne({
        where: { name: parentDef.name, isDefault: true, parentId: IsNull() },
      })

      if (!parent) {
        parent = this.categoryRepository.create({
          name: parentDef.name,
          description: parentDef.description,
          isDefault: true,
          fundId: null,
          parentId: null,
        })
        parent = await this.categoryRepository.save(parent)
      }

      allCategories.push(parent)

      // Create children if any
      if (parentDef.children) {
        for (const childDef of parentDef.children) {
          let child = await this.categoryRepository.findOne({
            where: { name: childDef.name, isDefault: true, parentId: parent.id },
          })

          if (!child) {
            child = this.categoryRepository.create({
              name: childDef.name,
              description: childDef.description,
              isDefault: true,
              fundId: null,
              parentId: parent.id,
            })
            child = await this.categoryRepository.save(child)
          }

          allCategories.push(child)
        }
      }
    }

    return allCategories
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
   * Used internally by services that already verified membership
   */
  async getActiveCategoriesForFund(fundId: string): Promise<Category[]> {
    // Get all active fund-category relationships
    const fundCategories = await this.fundCategoryRepository.find({
      where: { fundId, isActive: true },
      relations: ['category', 'category.parent', 'category.children'],
    })

    return fundCategories.map((fc) => fc.category)
  }

  /**
   * Create a custom category for a fund
   */
  async create(userId: string, dto: CreateCategoryDto) {
    await this.fundsService.assertMembership(dto.fundId, userId)

    // Check if category with same name already exists for this fund
    const existing = await this.categoryRepository.findOne({
      where: { name: dto.name, fundId: dto.fundId, isDefault: false },
    })

    if (existing) {
      throw new Error('Category with this name already exists for this fund')
    }

    const category = this.categoryRepository.create({
      ...dto,
      isDefault: false,
    })

    const savedCategory = await this.categoryRepository.save(category)

    // Link to fund
    const fundCategory = this.fundCategoryRepository.create({
      fundId: dto.fundId,
      categoryId: savedCategory.id,
      isActive: true,
    })

    await this.fundCategoryRepository.save(fundCategory)

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
   * Toggle category active status in a fund (for default categories)
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
