'use client';

import { useMemo } from 'react';
import { useCalculatorStore } from '@/store/useCalculatorStore';
import { calculate, getMultiplierPrices } from '@/lib/calculations';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatIDR } from '@/lib/format';

interface FieldProps {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
}

function Field({ label, unit, value, onChange, min = 0, step = 1 }: FieldProps) {
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium text-zinc-500">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          min={min}
          step={step}
          value={value === 0 ? '' : value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="bg-zinc-900 border-white/10 text-white text-base h-10 md:h-8 pr-10 focus-visible:ring-amber-500/30 focus-visible:border-amber-500/50"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500 pointer-events-none leading-none">
          {unit}
        </span>
      </div>
    </div>
  );
}

function IDRField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const formatted = value > 0 ? new Intl.NumberFormat('id-ID').format(Math.round(value)) : '';

  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium text-zinc-500">{label}</Label>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={formatted}
          onChange={(e) => {
            const digits = e.target.value.replace(/[^\d]/g, '');
            onChange(parseInt(digits, 10) || 0);
          }}
          className={cn(
            'flex h-10 md:h-8 w-full rounded-md border bg-zinc-900 border-white/10 text-white text-base pr-10 px-3 py-1',
            'placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1',
            'focus-visible:ring-amber-500/30 focus-visible:border-amber-500/50 transition-colors'
          )}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-500 pointer-events-none leading-none">
          IDR
        </span>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider pt-1">{children}</p>
  );
}

interface CalculatorFormProps {
  onPriceSelect?: (price: number) => void;
}

export function CalculatorForm({ onPriceSelect }: CalculatorFormProps) {
  const { inputs, setInput, resetInputs } = useCalculatorStore();
  const { totalCost } = useMemo(() => calculate(inputs), [inputs]);
  const multipliers = useMemo(() => getMultiplierPrices(totalCost), [totalCost]);

  const handlePriceSelect = (price: number) => {
    setInput('sellingPrice', price);
    onPriceSelect?.(price);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-300 uppercase tracking-wider">Inputs</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetInputs}
          className="h-6 px-2 text-sm text-zinc-500 hover:text-zinc-300"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset
        </Button>
      </div>

      <SectionLabel>Material</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Price per gram" unit="IDR" value={inputs.pricePerGram} onChange={(v) => setInput('pricePerGram', v)} step={10} />
        <Field label="Grams Used" unit="g" value={inputs.gramsUsed} onChange={(v) => setInput('gramsUsed', v)} step={1} />
      </div>

      <SectionLabel>Print</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Print Time" unit="hr" value={inputs.printHours} onChange={(v) => setInput('printHours', v)} step={0.5} />
        <Field label="Printer Power" unit="W" value={inputs.printerWatts} onChange={(v) => setInput('printerWatts', v)} step={10} />
      </div>

      <SectionLabel>Overheads</SectionLabel>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Electricity" unit="IDR/kWh" value={inputs.electricityRateKwh} onChange={(v) => setInput('electricityRateKwh', v)} step={10} />
        <Field label="Machine Rate" unit="IDR/hr" value={inputs.machineHourlyRate} onChange={(v) => setInput('machineHourlyRate', v)} step={100} />
        <Field label="Waste Factor" unit="%" value={inputs.wasteFactorPercent} onChange={(v) => setInput('wasteFactorPercent', v)} step={1} min={0} />
      </div>

      <SectionLabel>Pricing</SectionLabel>
      <div className="space-y-2">
        <IDRField
          label="Selling Price"
          value={inputs.sellingPrice}
          onChange={(v) => setInput('sellingPrice', v)}
        />

        {/* Multiplier suggestions */}
        <div className="pt-2">
          <p className="text-xs text-zinc-500 mb-1.5">Suggested prices based on cost:</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '3×', price: multipliers.x3 },
              { label: '4×', price: multipliers.x4 },
              { label: '5×', price: multipliers.x5 },
            ].map(({ label, price }) => (
              <button
                key={label}
                onClick={() => handlePriceSelect(price)}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-lg border transition-colors',
                  inputs.sellingPrice === price
                    ? 'bg-amber-500/20 border-amber-500/50'
                    : 'bg-zinc-800/50 border-white/10 hover:bg-zinc-800'
                )}
              >
                <span className="text-xs font-medium text-zinc-400">{label}</span>
                <span className="text-xs font-mono text-zinc-200 mt-0.5">{formatIDR(price)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
