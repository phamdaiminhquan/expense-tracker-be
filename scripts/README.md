# Migration Scripts

This directory contains database migration scripts for updating existing data.

## migrate-funds-numberid.ts

This script adds `numberId` and `description` fields to existing funds in the database.

### What it does:
- Finds all funds that don't have a `numberId` (NULL or empty)
- Generates a unique 6-digit `numberId` for each fund (format: 000000-999999)
- Sets `description` to `null` if it's not already set (preserves existing descriptions)

### Prerequisites:
- Database schema must be synchronized (columns must exist)
- `DATABASE_URL` environment variable must be set
- TypeORM entities must be accessible

### Usage:

```bash
# Using npm script (recommended)
npm run migrate:funds-numberid

# Or directly with ts-node
npx ts-node -r tsconfig-paths/register scripts/migrate-funds-numberid.ts

# Or with tsx (if installed)
npx tsx scripts/migrate-funds-numberid.ts
```

### Environment Variables:
- `DATABASE_URL`: PostgreSQL connection string (required)

### Output:
The script will:
- Show progress for each fund being updated
- Display a summary with success/error counts
- Exit with code 0 on success, 1 on error

### Safety:
- The script only updates funds that don't have a `numberId`
- It won't overwrite existing `numberId` values
- It preserves existing `description` values
- Each `numberId` is guaranteed to be unique

### Example Output:
```
🚀 Starting migration: Add numberId to existing funds...

✅ Database connection established

📊 Found 5 funds without numberId

  ✅ Fund "Family budget" (uuid-1) -> numberId: 023433
  ✅ Fund "Vacation fund" (uuid-2) -> numberId: 456789
  ✅ Fund "Personal expenses" (uuid-3) -> numberId: 123456
  ✅ Fund "Shared budget" (uuid-4) -> numberId: 789012
  ✅ Fund "Emergency fund" (uuid-5) -> numberId: 345678

==================================================
📈 Migration Summary:
   ✅ Successfully updated: 5
   ❌ Errors: 0
   📊 Total processed: 5
==================================================

✨ Migration completed successfully!
🔌 Database connection closed
```

