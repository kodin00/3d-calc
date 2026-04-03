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
    price_per_gram REAL,
    grams_used REAL NOT NULL,
    print_hours REAL NOT NULL,
    electricity_rate_kwh REAL,
    printer_watts REAL,
    machine_hourly_rate REAL,
    waste_factor_percent REAL,
    selling_price REAL NOT NULL,
    overhead_cost REAL DEFAULT 0,
    total_cost REAL,
    margin_percent REAL,
    print_count INTEGER DEFAULT 0,
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

// Migration: Add price_per_gram column if it doesn't exist
try {
  sqlite.exec(`ALTER TABLE products ADD COLUMN price_per_gram REAL`);
} catch {
  // Column already exists, ignore
}

// Migration: Add calculator settings columns if they don't exist
try {
  sqlite.exec(`ALTER TABLE products ADD COLUMN electricity_rate_kwh REAL`);
} catch {
  // Column already exists, ignore
}

try {
  sqlite.exec(`ALTER TABLE products ADD COLUMN printer_watts REAL`);
} catch {
  // Column already exists, ignore
}

try {
  sqlite.exec(`ALTER TABLE products ADD COLUMN machine_hourly_rate REAL`);
} catch {
  // Column already exists, ignore
}

try {
  sqlite.exec(`ALTER TABLE products ADD COLUMN waste_factor_percent REAL`);
} catch {
  // Column already exists, ignore
}
