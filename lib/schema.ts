export const SCHEMA = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin','editor')),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  short_title TEXT,
  description TEXT,
  sort INTEGER NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS manufacturers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  country TEXT,
  founded TEXT,
  site_url TEXT,
  summary TEXT,
  note TEXT,
  sort INTEGER NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS equipment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  manufacturer_id INTEGER REFERENCES manufacturers(id) ON DELETE SET NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  model TEXT,
  condition TEXT NOT NULL DEFAULT 'new' CHECK (condition IN ('new','used')),
  year INTEGER,
  price INTEGER,
  price_on_request INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_stock'
    CHECK (status IN ('in_stock','in_transit','on_order','reserved','sold')),
  specs TEXT NOT NULL DEFAULT '[]',
  description TEXT,
  condition_note TEXT,
  checked INTEGER NOT NULL DEFAULT 0,
  complete_set TEXT,
  power TEXT,
  weight TEXT,
  dimensions TEXT,
  images TEXT NOT NULL DEFAULT '[]',
  passport_url TEXT,
  is_published INTEGER NOT NULL DEFAULT 1,
  is_featured INTEGER NOT NULL DEFAULT 0,
  sort INTEGER NOT NULL DEFAULT 100,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  body TEXT,
  cover TEXT,
  equipment_id INTEGER REFERENCES equipment(id) ON DELETE SET NULL,
  published_at TEXT NOT NULL DEFAULT (datetime('now')),
  is_published INTEGER NOT NULL DEFAULT 1,
  is_pinned INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS catalogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  manufacturer_id INTEGER REFERENCES manufacturers(id) ON DELETE SET NULL,
  description TEXT,
  cover TEXT,
  pdf_url TEXT,
  pages_label TEXT,
  file_size TEXT,
  year INTEGER,
  sort INTEGER NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  equipment_id INTEGER REFERENCES equipment(id) ON DELETE SET NULL,
  source_page TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_progress','closed')),
  manager_note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pages (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  blocks TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_equipment_condition ON equipment(condition, is_published);
CREATE INDEX IF NOT EXISTS idx_equipment_slug ON equipment(slug);
CREATE INDEX IF NOT EXISTS idx_requests_created ON requests(created_at);
`;
