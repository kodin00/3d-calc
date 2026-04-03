import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const filaments = sqliteTable('filaments', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  brand: text('brand').notNull(),
  color: text('color').notNull(),
  material: text('material').notNull(),
  costPerKg: real('cost_per_kg').notNull(),
  spoolWeightG: real('spool_weight_g').notNull().default(1000),
  remainingWeightG: real('remaining_weight_g').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  filamentId: text('filament_id').references(() => filaments.id),
  pricePerGram: real('price_per_gram'), // Used when no filament is linked
  gramsUsed: real('grams_used').notNull(),
  printHours: real('print_hours').notNull(),
  electricityRateKwh: real('electricity_rate_kwh'), // Store for accurate recalculation
  printerWatts: real('printer_watts'),
  machineHourlyRate: real('machine_hourly_rate'),
  wasteFactorPercent: real('waste_factor_percent'),
  sellingPrice: real('selling_price').notNull(),
  overheadCost: real('overhead_cost').default(0),
  totalCost: real('total_cost'),
  marginPercent: real('margin_percent'),
  printCount: integer('print_count').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const presets = sqliteTable('presets', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  inputsJson: text('inputs_json').notNull(),
  createdAt: text('created_at').notNull(),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});
