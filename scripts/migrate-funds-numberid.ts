/**
 * Migration script to add numberId and description to existing funds
 * 
 * This script:
 * 1. Finds all funds without numberId
 * 2. Generates unique 6-digit numberId for each fund
 * 3. Sets description to null if not already set
 * 
 * Usage:
 *   npx ts-node -r tsconfig-paths/register scripts/migrate-funds-numberid.ts
 * 
 * Or with tsx:
 *   npx tsx scripts/migrate-funds-numberid.ts
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

// Load environment variables (try multiple locations)
// __dirname works with ts-node in CommonJS mode
const rootDir = resolve(__dirname, '..')
dotenv.config({ path: resolve(rootDir, '.env') })
dotenv.config({ path: resolve(rootDir, '.env.local') })
dotenv.config({ path: resolve(rootDir, '.env.develop') })

/**
 * Generates a unique 6-digit numberId
 */
function generateNumberId(): string {
  const randomNum = Math.floor(Math.random() * 1000000) // 0-999999
  return randomNum.toString().padStart(6, '0')
}

/**
 * Checks if a numberId already exists in the database
 */
async function numberIdExists(dataSource: DataSource, numberId: string): Promise<boolean> {
  const fundRepository = dataSource.getRepository(Fund)
  const existing = await fundRepository.findOne({ where: { numberId } })
  return !!existing
}

/**
 * Generates a unique numberId that doesn't exist in the database
 */
async function generateUniqueNumberId(dataSource: DataSource): Promise<string> {
  let numberId: string
  let exists = true
  let attempts = 0
  const maxAttempts = 100 // Increased for safety

  while (exists && attempts < maxAttempts) {
    numberId = generateNumberId()
    exists = await numberIdExists(dataSource, numberId)
    attempts++
  }

  if (exists) {
    throw new Error('Failed to generate unique numberId after multiple attempts')
  }

  return numberId!
}

async function migrateFunds() {
  console.log('🚀 Starting migration: Add numberId to existing funds...\n')

  // Validate DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is not set')
    console.error('   Please set DATABASE_URL in your .env file')
    process.exit(1)
  }

  // Create DataSource connection
  // Include all related entities so TypeORM can build metadata correctly
  // This includes the full chain: Fund -> FundMember/Message -> User/Transaction -> Category -> FundCategory
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [Fund, FundMember, Message, User, Transaction, Category, FundCategory],
    synchronize: false, // Don't auto-sync, we're just reading/writing
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

    const fundRepository = dataSource.getRepository(Fund)

    // Check if numberId column exists by trying to query it
    // If column doesn't exist, this will throw an error
    try {
      await fundRepository.query('SELECT numberId FROM funds LIMIT 1')
    } catch (error: any) {
      if (error.message?.includes('column') && error.message?.includes('numberId')) {
        console.error('❌ Error: numberId column does not exist in the funds table')
        console.error('   Please ensure the database schema has been synchronized first.')
        console.error('   The column should be created automatically if synchronize: true is set.')
        process.exit(1)
      }
      // If it's a different error (e.g., table doesn't exist), continue
    }

    // Find all funds without numberId or with null/empty numberId
    const fundsWithoutNumberId = await fundRepository
      .createQueryBuilder('fund')
      .where('fund.numberId IS NULL OR fund.numberId = :empty', { empty: '' })
      .getMany()

    console.log(`📊 Found ${fundsWithoutNumberId.length} funds without numberId\n`)

    if (fundsWithoutNumberId.length === 0) {
      console.log('✨ All funds already have numberId. Migration complete!')
      await dataSource.destroy()
      return
    }

    // Process each fund
    let successCount = 0
    let errorCount = 0

    for (const fund of fundsWithoutNumberId) {
      try {
        // Generate unique numberId
        const numberId = await generateUniqueNumberId(dataSource)

        // Update fund
        await fundRepository.update(
          { id: fund.id },
          {
            numberId,
            // Only set description to null if it's not already set
            // (don't overwrite existing descriptions)
            ...(fund.description === undefined || fund.description === null
              ? { description: null }
              : {}),
          },
        )

        console.log(`  ✅ Fund "${fund.name}" (${fund.id}) -> numberId: ${numberId}`)
        successCount++
      } catch (error) {
        console.error(`  ❌ Error updating fund "${fund.name}" (${fund.id}):`, error)
        errorCount++
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📈 Migration Summary:')
    console.log(`   ✅ Successfully updated: ${successCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
    console.log(`   📊 Total processed: ${fundsWithoutNumberId.length}`)
    console.log('='.repeat(50) + '\n')

    if (errorCount === 0) {
      console.log('✨ Migration completed successfully!')
    } else {
      console.log('⚠️  Migration completed with some errors. Please review the output above.')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Migration failed:', error)
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
migrateFunds()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

