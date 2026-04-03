export const DEFAULTS = {
  electricityRateKwh: 1500,      // IDR/kWh (rounded PLN tariff)
  machineHourlyRate: 500,        // IDR/hr
  wasteFactorPercent: 15,        // 15% of grams used
  pricePerGram: 200,             // IDR per gram
  printerWatts: 120,             // 120W power draw
  sellingPrice: 0,
  gramsUsed: 100,
  printHours: 4,
};

export const FILAMENT_MATERIALS = [
  'PLA',
  'PETG',
  'ABS',
  'TPU',
  'Nylon',
  'ASA',
  'PC',
  'Other',
] as const;

export type FilamentMaterial = (typeof FILAMENT_MATERIALS)[number];
