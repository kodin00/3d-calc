import { db } from './index';
import { presets, settings, filaments, products } from './schema';
import { eq } from 'drizzle-orm';
import type { CalculatorInputs, ProductWithFilament } from '@/types';
import { calculateProductCost } from '@/lib/productCalculations';
import { DEFAULTS } from '@/lib/constants';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Presets ────────────────────────────────────────────────────────────────

export async function getPresets() {
  return db.select().from(presets).orderBy(presets.createdAt);
}

export async function savePreset(name: string, inputs: CalculatorInputs) {
  const id = generateId();
  await db.insert(presets).values({
    id,
    name,
    inputsJson: JSON.stringify(inputs),
    createdAt: new Date().toISOString(),
  });
  return id;
}

export async function deletePreset(id: string) {
  await db.delete(presets).where(eq(presets.id, id));
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function getSetting(key: string): Promise<string | null> {
  const row = await db.select().from(settings).where(eq(settings.key, key)).get();
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string) {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}

// ─── Filaments (Phase 2) ─────────────────────────────────────────────────────

export async function getFilaments() {
  return db.select().from(filaments).orderBy(filaments.createdAt);
}

export async function addFilament(data: Omit<typeof filaments.$inferInsert, 'id' | 'createdAt'>) {
  const id = generateId();
  await db.insert(filaments).values({
    ...data,
    id,
    createdAt: new Date().toISOString(),
  });
  return id;
}

export async function updateFilament(id: string, data: Partial<typeof filaments.$inferInsert>) {
  await db.update(filaments).set(data).where(eq(filaments.id, id));
}

export async function deleteFilament(id: string) {
  await db.delete(filaments).where(eq(filaments.id, id));
}

// ─── Products (Phase 3) ──────────────────────────────────────────────────────

export async function getProducts() {
  return db.select().from(products).orderBy(products.createdAt);
}

export async function getProductsWithFilament(): Promise<ProductWithFilament[]> {
  const allProducts = await db.select().from(products).orderBy(products.createdAt);
  const allFilaments = await db.select().from(filaments);
  const filamentMap = new Map(allFilaments.map(f => [f.id, f]));

  return allProducts.map(p => ({
    ...p,
    filament: p.filamentId ? filamentMap.get(p.filamentId) ?? null : null,
  }));
}

async function calculateProductFields(
  filamentId: string | null,
  pricePerGram: number | null,
  gramsUsed: number,
  printHours: number,
  overheadCost: number,
  sellingPrice: number,
  electricityRateKwh: number | null,
  printerWatts: number | null,
  machineHourlyRate: number | null,
  wasteFactorPercent: number | null
): Promise<{ totalCost: number; marginPercent: number }> {
  // Get electricity rate from settings if not provided
  let electricityRate = electricityRateKwh ?? DEFAULTS.electricityRateKwh;
  if (!electricityRateKwh) {
    const rateStr = await getSetting('electricityRateKwh');
    const parsed = rateStr ? parseFloat(rateStr) : NaN;
    if (!isNaN(parsed) && parsed > 0) {
      electricityRate = parsed;
    }
  }

  // Get filament cost if linked
  let filamentCostPerKg: number | null = null;
  if (filamentId) {
    const filament = await db.select().from(filaments).where(eq(filaments.id, filamentId)).get();
    filamentCostPerKg = filament?.costPerKg ?? null;
  }

  const result = calculateProductCost({
    filamentCostPerKg,
    pricePerGram,
    gramsUsed,
    printHours,
    electricityRateKwh: electricityRate,
    printerWatts: printerWatts ?? DEFAULTS.printerWatts,
    machineHourlyRate: machineHourlyRate ?? DEFAULTS.machineHourlyRate,
    wasteFactorPercent: wasteFactorPercent ?? DEFAULTS.wasteFactorPercent,
    overheadCost,
    sellingPrice,
  });

  return {
    totalCost: result.totalCost,
    marginPercent: result.marginPercent,
  };
}

export async function addProduct(data: Omit<typeof products.$inferInsert, 'id' | 'createdAt' | 'updatedAt' | 'totalCost' | 'marginPercent'>) {
  const id = generateId();
  const now = new Date().toISOString();

  const overhead = data.overheadCost ?? 0;
  const filamentId = data.filamentId ?? null;
  const pricePerGram = data.pricePerGram ?? null;

  const { totalCost, marginPercent } = await calculateProductFields(
    filamentId,
    pricePerGram,
    data.gramsUsed,
    data.printHours,
    overhead,
    data.sellingPrice,
    data.electricityRateKwh ?? null,
    data.printerWatts ?? null,
    data.machineHourlyRate ?? null,
    data.wasteFactorPercent ?? null
  );

  await db.insert(products).values({
    ...data,
    filamentId,
    pricePerGram,
    overheadCost: overhead,
    id,
    totalCost,
    marginPercent,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function updateProduct(id: string, data: Partial<typeof products.$inferInsert>) {
  // Fetch existing product to get values not being updated
  const existing = await db.select().from(products).where(eq(products.id, id)).get();
  if (!existing) throw new Error('Product not found');

  const filamentId = data.filamentId ?? existing.filamentId;
  const pricePerGram = data.pricePerGram ?? existing.pricePerGram;
  const gramsUsed = data.gramsUsed ?? existing.gramsUsed;
  const printHours = data.printHours ?? existing.printHours;
  const overhead = data.overheadCost ?? existing.overheadCost ?? 0;
  const sellingPrice = data.sellingPrice ?? existing.sellingPrice;
  const electricityRateKwh = data.electricityRateKwh ?? existing.electricityRateKwh;
  const printerWatts = data.printerWatts ?? existing.printerWatts;
  const machineHourlyRate = data.machineHourlyRate ?? existing.machineHourlyRate;
  const wasteFactorPercent = data.wasteFactorPercent ?? existing.wasteFactorPercent;

  const { totalCost, marginPercent } = await calculateProductFields(
    filamentId,
    pricePerGram,
    gramsUsed,
    printHours,
    overhead,
    sellingPrice,
    electricityRateKwh,
    printerWatts,
    machineHourlyRate,
    wasteFactorPercent
  );

  await db.update(products).set({
    ...data,
    overheadCost: overhead,
    totalCost,
    marginPercent,
    updatedAt: new Date().toISOString(),
  }).where(eq(products.id, id));
}

export async function deleteProduct(id: string) {
  await db.delete(products).where(eq(products.id, id));
}

// ─── Clear all products ─────────────────────────────────────────────────────

export async function clearAllProducts() {
  await db.delete(products);
}

// ─── Print Product (deduct filament weight) ───────────────────────────────────

export async function printProduct(productId: string): Promise<{ success: boolean; newRemainingWeight: number; printCount: number }> {
  // Get the product
  const product = await db.select().from(products).where(eq(products.id, productId)).get();
  if (!product) {
    throw new Error('Product not found');
  }

  if (!product.filamentId) {
    throw new Error('Product has no linked filament');
  }

  // Get the filament
  const filament = await db.select().from(filaments).where(eq(filaments.id, product.filamentId)).get();
  if (!filament) {
    throw new Error('Linked filament not found');
  }

  // Calculate new remaining weight
  const newRemainingWeight = Math.max(0, filament.remainingWeightG - product.gramsUsed);

  // Calculate new print count
  const newPrintCount = (product.printCount ?? 0) + 1;

  // Update the filament
  await db.update(filaments)
    .set({ remainingWeightG: newRemainingWeight })
    .where(eq(filaments.id, product.filamentId));

  // Increment the print count on the product
  await db.update(products)
    .set({ printCount: newPrintCount })
    .where(eq(products.id, productId));

  return { success: true, newRemainingWeight, printCount: newPrintCount };
}
