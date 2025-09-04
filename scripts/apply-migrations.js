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

// URL-encode password portion if it contains reserved characters like #
function sanitizePostgresUrl(url) {
  try {
    const schemeIdx = url.indexOf('://')
    const atIdx = url.lastIndexOf('@')
    if (schemeIdx === -1 || atIdx === -1 || atIdx < schemeIdx) return url
    const userInfo = url.substring(schemeIdx + 3, atIdx)
    const colonIdx = userInfo.indexOf(':')
    if (colonIdx === -1) return url
    const user = userInfo.substring(0, colonIdx)
    const pass = userInfo.substring(colonIdx + 1)
    // If password already looks encoded, keep it; otherwise encode
    const encodedPass = /%[0-9A-Fa-f]{2}/.test(pass) ? pass : encodeURIComponent(pass)
    const before = url.substring(0, schemeIdx + 3)
    const after = url.substring(atIdx)
    return `${before}${user}:${encodedPass}${after}`
  } catch {
    return url
  }
}

async function run() {
  const dbUrl = sanitizePostgresUrl(getDbUrl())
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 12000 })
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

  // Log connection target without secrets
  try {
    const u = new URL(dbUrl.replace('postgresql://', 'postgres://'))
    const host = u.hostname
    const port = u.port || '5432'
    const pooled = /pooler|pgbouncer/i.test(dbUrl)
    console.log(`[migrate] Connecting to ${host}:${port} (pooled=${pooled}) ...`)
  } catch {}

  // Connect with a timeout to avoid hanging indefinitely
  await client.connect()
  // Quick ping
  try {
    await client.query('SELECT 1')
  } catch (e) {
    console.error('[migrate] Ping failed:', e.message)
    throw e
  }
  console.log(`Connected to database. Applying ${files.length} migrations...`)

  const pooled = /pooler|pgbouncer/i.test(dbUrl)
  if (pooled) {
    console.log('[migrate] Detected pooled connection string; executing without explicit transactions.')
  }

  for (const file of files) {
    const full = path.join(migrationsDir, file)
    const sql = fs.readFileSync(full, 'utf8')
    if (!sql.trim()) continue
    process.stdout.write(`→ ${file} ... `)
    try {
      if (!pooled) {
        await client.query('BEGIN')
      }
      await client.query(sql)
      if (!pooled) {
        await client.query('COMMIT')
      }
      console.log('OK')
    } catch (err) {
      if (!pooled) {
        await client.query('ROLLBACK')
      }
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
