import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'app.db');
const sqlite = new Database(dbPath);

// Allow up to 10s wait for concurrent build workers
sqlite.pragma('busy_timeout = 10000');
// Enable WAL mode for better read/write concurrency
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

// Inline schema creation (for dev, no migration files needed)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS filaments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    color TEXT NOT NULL,
    material TEXT NOT NULL,
    cost_per_kg REAL NOT NULL,
    spool_weight_g REAL NOT NULL DEFAULT 1000,
    remaining_weight_g REAL NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    filament_id TEXT REFERENCES filaments(id),
    grams_used REAL NOT NULL,
    print_hours REAL NOT NULL,
    selling_price REAL NOT NULL,
    overhead_cost REAL DEFAULT 0,
    total_cost REAL,
    margin_percent REAL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS presets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    inputs_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Migration: Add overhead_cost column if it doesn't exist (for existing databases)
try {
  sqlite.exec(`ALTER TABLE products ADD COLUMN overhead_cost REAL DEFAULT 0`);
} catch {
  // Column already exists, ignore
}

// Migration: Add print_count column if it doesn't exist
try {
  sqlite.exec(`ALTER TABLE products ADD COLUMN print_count INTEGER DEFAULT 0`);
} catch {
  // Column already exists, ignore
}
