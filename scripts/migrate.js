#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env', override: false })

// Fallback: if Postgres URL wasn't picked up, try to parse from .env.local manually
function ensureDbUrlLoaded() {
	if (process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL) {
		return
	}
		const envPaths = ['.env.local', '.env']
		for (const p of envPaths) {
			const envPath = path.join(process.cwd(), p)
			if (!fs.existsSync(envPath)) continue
			const txt = fs.readFileSync(envPath, 'utf8')
			try {
				const parsed = dotenv.parse(txt)
				for (const [k, v] of Object.entries(parsed)) {
					if (!(k in process.env)) process.env[k] = v
				}
			} catch {}

				// Heuristic: if no POSTGRES_* var available, try to extract from non-comment lines only
					if (!process.env.POSTGRES_URL_NON_POOLING && !process.env.POSTGRES_PRISMA_URL && !process.env.POSTGRES_URL) {
					const lines = txt.split(/\r?\n/)
					for (const lineRaw of lines) {
						const line = lineRaw.trim()
						if (!line || line.startsWith('#')) continue
						// Prefer explicit keys first
						const kv = line.match(/^(POSTGRES_URL_NON_POOLING|POSTGRES_PRISMA_URL|POSTGRES_URL)\s*=\s*(.+)$/)
						if (kv) {
							let val = kv[2].trim()
							if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
								val = val.slice(1, -1)
							}
							process.env[kv[1]] = val
							console.log(`[migrate] Loaded ${kv[1]} from ${p}`)
							break
						}
						// Otherwise detect a postgres/postgresql URL in this line
						const m = line.match(/postgres(?:ql)?:\/\/[^\s]+/i)
						if (m && m[0]) {
							process.env.POSTGRES_URL = m[0]
							console.log(`[migrate] Extracted POSTGRES_URL from ${p}`)
							break
						}
					}
				}
		}
		const key = ['POSTGRES_URL_NON_POOLING', 'POSTGRES_PRISMA_URL', 'POSTGRES_URL'].find((k) => !!process.env[k])
		if (key) {
			console.log(`[migrate] Using ${key} from env`)
		}
}

ensureDbUrlLoaded()

const hasNP = !!process.env.POSTGRES_URL_NON_POOLING
const hasPrisma = !!process.env.POSTGRES_PRISMA_URL
const hasUrl = !!process.env.POSTGRES_URL
console.log(`[migrate] has POSTGRES_URL_NON_POOLING=${hasNP} POSTGRES_PRISMA_URL=${hasPrisma} POSTGRES_URL=${hasUrl}`)

require('./apply-migrations')
