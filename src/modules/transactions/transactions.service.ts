import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Transaction } from './transaction.entity'

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async create(data: {
    fundId: string
    createdById: string
    categoryId?: string | null
    spendValue?: number | null
    earnValue?: number | null
    content?: string | null
    metadata?: Record<string, unknown> | null
  }): Promise<Transaction> {
    const transaction = this.transactionRepository.create(data)
    return this.transactionRepository.save(transaction)
  }

  async findByFund(fundId: string): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: { fundId },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    })
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.transactionRepository.findOne({
      where: { id },
      relations: ['category', 'fund'],
    })
  }

  async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const transaction = await this.findById(id)
    if (!transaction) {
      throw new NotFoundException('Transaction not found')
    }
    Object.assign(transaction, data)
    return this.transactionRepository.save(transaction)
  }

  async delete(id: string) {
    await this.transactionRepository.softDelete({ id })
  }
}

