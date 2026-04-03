import { DEFAULTS } from './constants';

export interface ProductCalcParams {
  filamentCostPerKg: number | null;
  pricePerGram: number | null;
  gramsUsed: number;
  printHours: number;
  electricityRateKwh: number;
  printerWatts?: number;
  machineHourlyRate?: number;
  wasteFactorPercent?: number;
  overheadCost: number;
  sellingPrice: number;
}

export interface ProductCalcResult {
  materialCost: number;
  electricityCost: number;
  machineCost: number;
  wasteCost: number;
  overheadCost: number;
  totalCost: number;
  marginPercent: number;
  profit: number;
}

export function calculateProductCost(params: ProductCalcParams): ProductCalcResult {
  const {
    filamentCostPerKg,
    pricePerGram,
    gramsUsed,
    printHours,
    electricityRateKwh,
    printerWatts = DEFAULTS.printerWatts,
    machineHourlyRate = DEFAULTS.machineHourlyRate,
    wasteFactorPercent = DEFAULTS.wasteFactorPercent,
    overheadCost,
    sellingPrice,
  } = params;

  // Calculate material cost using same formula as calculator
  // Priority: filamentCostPerKg > pricePerGram > 0
  let materialCost: number;
  if (filamentCostPerKg) {
    // Convert per-kg to per-gram and apply waste factor to grams
    const costPerGram = filamentCostPerKg / 1000;
    const effectiveGrams = gramsUsed * (1 + wasteFactorPercent / 100);
    materialCost = costPerGram * effectiveGrams;
  } else if (pricePerGram) {
    // Use price per gram directly with waste factor applied to grams
    const effectiveGrams = gramsUsed * (1 + wasteFactorPercent / 100);
    materialCost = pricePerGram * effectiveGrams;
  } else {
    materialCost = 0;
  }

  const electricityCost = (printerWatts / 1000) * printHours * electricityRateKwh;
  const machineCost = machineHourlyRate * printHours;

  // Total cost is just material + electricity + machine + overhead
  // Waste is already included in materialCost
  const totalCost = materialCost + electricityCost + machineCost + overheadCost;

  const marginPercent = sellingPrice > 0
    ? ((sellingPrice - totalCost) / sellingPrice) * 100
    : 0;
  const profit = sellingPrice - totalCost;

  return {
    materialCost,
    electricityCost,
    machineCost,
    wasteCost: 0, // Waste is now included in materialCost
    overheadCost,
    totalCost,
    marginPercent,
    profit,
  };
}
