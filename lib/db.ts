import path from 'node:path'
import fs from 'node:fs'
import Database from 'better-sqlite3'
import { SCHEMA } from './schema'

export type DB = Database.Database

const globalForDb = globalThis as unknown as { __vipServiceDb?: DB }

function resolveDbPath() {
  const raw = process.env.DATABASE_PATH || './data/vip-service.db'
  return path.isAbsolute(raw) ? raw : path.join(process.cwd(), raw)
}

function open(): DB {
  const file = resolveDbPath()
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const db = new Database(file)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.exec(SCHEMA)
  // Наполнение при первом запуске: idempotent, проверяет наличие пользователей.
  const { seeded } = db
    .prepare("SELECT COUNT(*) as seeded FROM users")
    .get() as { seeded: number }
  if (!seeded) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { seedDatabase } = require('./seed') as typeof import('./seed')
    seedDatabase(db)
  }
  return db
}

export function getDb(): DB {
  if (!globalForDb.__vipServiceDb) {
    globalForDb.__vipServiceDb = open()
  }
  return globalForDb.__vipServiceDb
}
