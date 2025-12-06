import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Category } from './category.entity'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { FundsService } from '../funds/funds.service'

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly fundsService: FundsService,
  ) {}

  async listByFund(fundId: string, userId: string) {
    await this.fundsService.assertMembership(fundId, userId)
    return this.categoryRepository.find({ where: { fundId } })
  }

  async create(userId: string, dto: CreateCategoryDto) {
    await this.fundsService.assertMembership(dto.fundId, userId)
    const category = this.categoryRepository.create(dto)
    return this.categoryRepository.save(category)
  }

  async update(categoryId: string, userId: string, dto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({ where: { id: categoryId } })
    if (!category) {
      return null
    }

    await this.fundsService.assertMembership(category.fundId, userId)
    Object.assign(category, dto)
    return this.categoryRepository.save(category)
  }

  async remove(categoryId: string, userId: string) {
    const category = await this.categoryRepository.findOne({ where: { id: categoryId } })
    if (!category) {
      return null
    }

    await this.fundsService.assertMembership(category.fundId, userId)
    await this.categoryRepository.softDelete({ id: categoryId })
    return { success: true }
  }
}
