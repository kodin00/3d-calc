import { useState, useEffect, useCallback } from 'react';
import { CalculatorForm } from '@/components/calculator/CalculatorForm';
import { ResultsPanel } from '@/components/calculator/ResultsPanel';
import { ElectricityRateSetting } from '@/components/calculator/ElectricityRateSetting';
import { useToastStore } from '@/store/useToastStore';

export default function CalculatorPage() {
  const [electricityRate, setElectricityRate] = useState<string | null>(null);
  const toast = useToastStore();

  const fetchData = useCallback(async () => {
    try {
      const rateRes = await fetch('/api/settings/electricityRateKwh');
      if (!rateRes.ok) throw new Error('Failed to fetch data');
      const rateData = await rateRes.json();
      setElectricityRate(rateData.value ?? null);
    } catch {
      toast.error('Failed to load calculator data');
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="p-3 md:p-4 space-y-3 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-white leading-tight">Cost Calculator</h1>
          <p className="text-xs md:text-sm text-zinc-500">Calculate print costs &amp; pricing</p>
        </div>
        <div className="flex items-center gap-2">
          <ElectricityRateSetting defaultRate={electricityRate} onSaved={fetchData} />
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <div className="rounded-2xl bg-zinc-900/50 border border-white/10 p-3 md:p-4">
          <CalculatorForm />
        </div>
        <div className="rounded-2xl bg-zinc-900/50 border border-white/10 p-3 md:p-4">
          <h2 className="text-sm md:text-base font-semibold text-zinc-300 uppercase tracking-wider mb-3">Results</h2>
          <ResultsPanel />
        </div>
      </div>
    </div>
  );
}
