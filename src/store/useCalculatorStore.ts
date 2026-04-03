import { create } from 'zustand';
import type { CalculatorInputs } from '@/types';
import { DEFAULTS } from '@/lib/constants';

interface CalculatorStore {
  inputs: CalculatorInputs;
  setInput: <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => void;
  setInputs: (inputs: Partial<CalculatorInputs>) => void;
  resetInputs: () => void;
}

const defaultInputs: CalculatorInputs = {
  pricePerGram: DEFAULTS.pricePerGram,
  gramsUsed: DEFAULTS.gramsUsed,
  printerWatts: DEFAULTS.printerWatts,
  printHours: DEFAULTS.printHours,
  electricityRateKwh: DEFAULTS.electricityRateKwh,
  machineHourlyRate: DEFAULTS.machineHourlyRate,
  wasteFactorPercent: DEFAULTS.wasteFactorPercent,
  sellingPrice: DEFAULTS.sellingPrice,
};

export const useCalculatorStore = create<CalculatorStore>((set) => ({
  inputs: { ...defaultInputs },

  setInput: (key, value) =>
    set((state) => ({
      inputs: { ...state.inputs, [key]: value },
    })),

  setInputs: (partial) =>
    set((state) => ({
      inputs: { ...state.inputs, ...partial },
    })),

  resetInputs: () => set({ inputs: { ...defaultInputs } }),
}));
