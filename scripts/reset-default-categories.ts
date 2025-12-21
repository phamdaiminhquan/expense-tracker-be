/**
 * Migration script to reset default categories in the database
 * 
 * This script:
 * 1. Deletes all FundCategory relationships for default categories
 * 2. Deletes all default categories (parents and children)
 * 3. Creates new default categories from DEFAULT_CATEGORIES definition
 * 
 * Usage:
 *   npx ts-node -r tsconfig-paths/register scripts/reset-default-categories.ts
 * 
 * Or with tsx:
 *   npx tsx scripts/reset-default-categories.ts
 */

import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

import { Fund } from '../src/modules/funds/entity/fund.entity'
import { FundMember } from '../src/modules/funds/entity/fund-member.entity'
import { Message } from '../src/modules/messages/message.entity'
import { User } from '../src/modules/users/user.entity'
import { Transaction } from '../src/modules/transactions/transaction.entity'
import { Category } from '../src/modules/categories/category.entity'
import { FundCategory } from '../src/modules/categories/fund-category.entity'
import { DEFAULT_CATEGORIES } from '../src/modules/categories/default-categories'

// Load environment variables (try multiple locations)
const rootDir = resolve(__dirname, '..')
dotenv.config({ path: resolve(rootDir, '.env') })
dotenv.config({ path: resolve(rootDir, '.env.local') })
dotenv.config({ path: resolve(rootDir, '.env.develop') })

async function resetDefaultCategories() {
  console.log('🚀 Starting migration: Reset default categories...\n')

  // Validate DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is not set')
    console.error('   Please set DATABASE_URL in your .env file')
    process.exit(1)
  }

  // Create DataSource connection
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [Fund, FundMember, Message, User, Transaction, Category, FundCategory],
    synchronize: false,
    logging: false,
    ssl: process.env.DATABASE_URL?.includes('sslmode=require') || 
        process.env.DATABASE_URL?.includes('ssl=true')
      ? { rejectUnauthorized: false }
      : false,
  })

  try {
    // Initialize connection
    await dataSource.initialize()
    console.log('✅ Database connection established\n')

    const categoryRepository = dataSource.getRepository(Category)
    const fundCategoryRepository = dataSource.getRepository(FundCategory)

    // Step 1: Get all default categories
    const defaultCategories = await categoryRepository.find({
      where: { isDefault: true },
      relations: ['fundCategories'],
    })

    console.log(`📊 Found ${defaultCategories.length} default categories in database\n`)

    // Step 2: Delete all FundCategory relationships for default categories
    if (defaultCategories.length > 0) {
      const defaultCategoryIds = defaultCategories.map(cat => cat.id)
      
      // Use query builder for better type safety
      const deleteResult = await fundCategoryRepository
        .createQueryBuilder()
        .delete()
        .where('categoryId IN (:...ids)', { ids: defaultCategoryIds })
        .execute()

      console.log(`🗑️  Deleted FundCategory relationships: ${deleteResult.affected || 0} rows`)
    }

    // Step 3: Delete all default categories
    // Delete children first (due to foreign key constraint)
    const childCategories = defaultCategories.filter(cat => cat.parentId !== null)
    const parentCategories = defaultCategories.filter(cat => cat.parentId === null)

    if (childCategories.length > 0) {
      await categoryRepository.delete(childCategories.map(cat => ({ id: cat.id })))
      console.log(`  ✅ Deleted ${childCategories.length} child categories`)
    }

    if (parentCategories.length > 0) {
      await categoryRepository.delete(parentCategories.map(cat => ({ id: cat.id })))
      console.log(`  ✅ Deleted ${parentCategories.length} parent categories`)
    }

    console.log('\n📝 Creating new default categories...\n')

    // Step 4: Create new default categories from DEFAULT_CATEGORIES
    let createdParents = 0
    let createdChildren = 0

    for (const parentDef of DEFAULT_CATEGORIES) {
      // Create parent category
      const parent = categoryRepository.create({
        name: parentDef.name,
        description: parentDef.description,
        isDefault: true,
        fundId: null,
        parentId: null,
      })
      const savedParent = await categoryRepository.save(parent)
      createdParents++
      console.log(`  ✅ Created parent: "${parentDef.name}"`)

      // Create children if any
      if (parentDef.children && parentDef.children.length > 0) {
        for (const childDef of parentDef.children) {
          const child = categoryRepository.create({
            name: childDef.name,
            description: childDef.description,
            isDefault: true,
            fundId: null,
            parentId: savedParent.id,
          })
          await categoryRepository.save(child)
          createdChildren++
        }
        console.log(`     └─ Created ${parentDef.children.length} children`)
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📈 Migration Summary:')
    console.log(`   🗑️  Deleted old categories: ${defaultCategories.length}`)
    console.log(`   ✅ Created parent categories: ${createdParents}`)
    console.log(`   ✅ Created child categories: ${createdChildren}`)
    console.log(`   📊 Total new categories: ${createdParents + createdChildren}`)
    console.log('='.repeat(50) + '\n')

    console.log('✨ Migration completed successfully!')
    console.log('💡 Note: Existing funds will need to subscribe to categories manually')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Stack:', error.stack)
    }
    process.exit(1)
  } finally {
    // Close connection
    if (dataSource.isInitialized) {
      await dataSource.destroy()
      console.log('🔌 Database connection closed')
    }
  }
}

// Run migration
resetDefaultCategories()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

