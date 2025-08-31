#!/usr/bin/env node
/*
 Apply all SQL files in supabase/migrations to the target database.
 Uses POSTGRES_URL_NON_POOLING (fallbacks: POSTGRES_PRISMA_URL, POSTGRES_URL) from .env.
*/
const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

function getDbUrl() {
  const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL
  if (!url) {
    throw new Error('Missing Postgres connection string. Set POSTGRES_URL_NON_POOLING (or POSTGRES_PRISMA_URL/POSTGRES_URL).')
  }
  return url
}

async function run() {
  const dbUrl = getDbUrl()
  const client = new Client({ connectionString: dbUrl })
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations')

  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`)
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b))

  if (files.length === 0) {
    console.log('No migration files found.')
    return
  }

  await client.connect()
  console.log(`Connected to database. Applying ${files.length} migrations...`)

  for (const file of files) {
    const full = path.join(migrationsDir, file)
    const sql = fs.readFileSync(full, 'utf8')
    if (!sql.trim()) continue
    process.stdout.write(`→ ${file} ... `)
    try {
      await client.query('BEGIN')
      await client.query(sql)
      await client.query('COMMIT')
      console.log('OK')
    } catch (err) {
      await client.query('ROLLBACK')
      console.error(`FAILED\n${err.message}`)
      await client.end()
      process.exit(1)
    }
  }

  await client.end()
  console.log('All migrations applied successfully.')
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
