import { DEFAULTS } from './constants';

export interface ProductCalcParams {
  filamentCostPerKg: number | null;
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
    gramsUsed,
    printHours,
    electricityRateKwh,
    printerWatts = DEFAULTS.printerWatts,
    machineHourlyRate = DEFAULTS.machineHourlyRate,
    wasteFactorPercent = DEFAULTS.wasteFactorPercent,
    overheadCost,
    sellingPrice,
  } = params;

  const materialCost = filamentCostPerKg ? (filamentCostPerKg / 1000) * gramsUsed : 0;
  const electricityCost = (printerWatts / 1000) * printHours * electricityRateKwh;
  const machineCost = machineHourlyRate * printHours;

  const subtotal = materialCost + electricityCost + machineCost;
  const wasteCost = subtotal * (wasteFactorPercent / 100);
  const totalCost = subtotal + wasteCost + overheadCost;

  const marginPercent = sellingPrice > 0
    ? ((sellingPrice - totalCost) / sellingPrice) * 100
    : 0;
  const profit = sellingPrice - totalCost;

  return {
    materialCost,
    electricityCost,
    machineCost,
    wasteCost,
    overheadCost,
    totalCost,
    marginPercent,
    profit,
  };
}