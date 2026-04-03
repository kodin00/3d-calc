export interface CalculatorInputs {
  pricePerGram: number;
  gramsUsed: number;
  printerWatts: number;
  printHours: number;
  electricityRateKwh: number;
  machineHourlyRate: number;
  wasteFactorPercent: number;
  sellingPrice: number;
}

export interface CalculatorResults {
  materialCost: number;
  electricityCost: number;
  machineCost: number;
  subtotal: number;
  wasteCost: number;
  totalCost: number;
  suggestedPrice: number;
  actualMarginPercent: number;
  profit: number;
}

export interface Preset {
  id: string;
  name: string;
  inputsJson: string;
  createdAt: string;
}

export interface FilamentRecord {
  id: string;
  name: string;
  brand: string;
  color: string;
  material: string;
  costPerKg: number;
  spoolWeightG: number;
  remainingWeightG: number;
  notes: string | null;
  createdAt: string;
}

export interface ProductRecord {
  id: string;
  name: string;
  description: string | null;
  filamentId: string | null;
  gramsUsed: number;
  printHours: number;
  sellingPrice: number;
  overheadCost: number | null;
  totalCost: number | null;
  marginPercent: number | null;
  printCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductWithFilament extends ProductRecord {
  filament: {
    id: string;
    name: string;
    brand: string;
    color: string;
    material: string;
    costPerKg: number;
  } | null;
}
