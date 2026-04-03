import { create } from 'zustand';
import type { FilamentRecord } from '@/types';
import { calculateProductCost } from '@/lib/productCalculations';
import { DEFAULTS } from '@/lib/constants';

interface ProductFormState {
  // Form fields (filamentId uses empty string for "none")
  name: string;
  description: string;
  filamentId: string;
  gramsUsed: string;
  printHours: string;
  overheadCost: string;
  sellingPrice: string;

  // Reference data
  filaments: FilamentRecord[];
  electricityRateKwh: number;

  // Actions
  setField: (field: keyof Pick<ProductFormState, 'name' | 'description' | 'filamentId' | 'gramsUsed' | 'printHours' | 'overheadCost' | 'sellingPrice'>, value: string) => void;
  setFilaments: (filaments: FilamentRecord[]) => void;
  setElectricityRate: (rate: number) => void;
  reset: () => void;
  getSelectedFilament: () => FilamentRecord | null;
  getPreview: () => ReturnType<typeof calculateProductCost> | null;
}

const initialFormValues = {
  name: '',
  description: '',
  filamentId: '',
  gramsUsed: '100',
  printHours: '4',
  overheadCost: '0',
  sellingPrice: '50000',
};

const initialState = {
  ...initialFormValues,
  filaments: [] as FilamentRecord[],
  electricityRateKwh: DEFAULTS.electricityRateKwh,
};

export const useProductFormStore = create<ProductFormState>((set, get) => ({
  ...initialState,

  setField: (field, value) => set({ [field]: value }),

  setFilaments: (filaments) => set({ filaments }),

  setElectricityRate: (rate) => set({ electricityRateKwh: rate }),

  reset: () => set({ ...initialFormValues }),

  getSelectedFilament: () => {
    const { filamentId, filaments } = get();
    if (!filamentId) return null;
    return filaments.find(f => f.id === filamentId) ?? null;
  },

  getPreview: () => {
    const state = get();
    const gramsUsed = parseFloat(state.gramsUsed) || 0;
    const printHours = parseFloat(state.printHours) || 0;
    const overheadCost = parseFloat(state.overheadCost) || 0;
    const sellingPrice = parseFloat(state.sellingPrice) || 0;

    if (gramsUsed <= 0 || printHours <= 0 || sellingPrice <= 0) {
      return null;
    }

    const selectedFilament = state.getSelectedFilament();

    return calculateProductCost({
      filamentCostPerKg: selectedFilament?.costPerKg ?? null,
      gramsUsed,
      printHours,
      electricityRateKwh: state.electricityRateKwh,
      overheadCost,
      sellingPrice,
    });
  },
}));