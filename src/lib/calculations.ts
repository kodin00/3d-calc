import type { CalculatorInputs, CalculatorResults } from '@/types';

export function calculate(inputs: CalculatorInputs): CalculatorResults {
  const {
    pricePerGram,
    gramsUsed,
    printerWatts,
    printHours,
    electricityRateKwh,
    machineHourlyRate,
    wasteFactorPercent,
    sellingPrice,
  } = inputs;

  // Material cost: price per gram * (grams + waste buffer)
  const effectiveGrams = gramsUsed * (1 + wasteFactorPercent / 100);
  const materialCost = pricePerGram * effectiveGrams;

  const electricityCost = (printerWatts / 1000) * printHours * electricityRateKwh;
  const machineCost = machineHourlyRate * printHours;

  const subtotal = materialCost + electricityCost + machineCost;
  const totalCost = subtotal;

  const actualMarginPercent = sellingPrice > 0
    ? ((sellingPrice - totalCost) / sellingPrice) * 100
    : 0;
  const profit = sellingPrice - totalCost;

  return {
    materialCost,
    electricityCost,
    machineCost,
    subtotal,
    wasteCost: 0, // waste is now included in materialCost
    totalCost,
    suggestedPrice: sellingPrice,
    actualMarginPercent,
    profit,
  };
}

export function getMultiplierPrices(totalCost: number): { x3: number; x4: number; x5: number } {
  return {
    x3: Math.round(totalCost * 3),
    x4: Math.round(totalCost * 4),
    x5: Math.round(totalCost * 5),
  };
}

/**
 * Calculate print hours based on grams used.
 * 20g = 1 hour minimum, anything over multiples of 20g adds an hour.
 * <=20g = 1 hour, 21-40g = 2 hours, etc.
 */
export function calculatePrintHours(gramsUsed: number): number {
  if (gramsUsed <= 0) return 0;
  return Math.ceil(gramsUsed / 20);
}
