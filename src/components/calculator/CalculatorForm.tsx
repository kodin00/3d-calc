'use client';

import { useMemo, useEffect, useRef } from 'react';
import { useCalculatorStore } from '@/store/useCalculatorStore';
import { calculate, getMultiplierPrices, calculatePrintHours } from '@/lib/calculations';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RotateCcw, Clock } from 'lucide-react';
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

function IDRField({ label, value, onChange, highlighted = false }: { label: string; value: number; onChange: (v: number) => void; highlighted?: boolean }) {
  const formatted = value > 0 ? new Intl.NumberFormat('id-ID').format(Math.round(value)) : '';

  return (
    <div className="space-y-1">
      <Label className={cn(
        'text-sm font-medium',
        highlighted ? 'text-amber-400' : 'text-zinc-500'
      )}>{label}</Label>
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
            'flex h-10 md:h-8 w-full rounded-md border text-white text-base pr-10 px-3 py-1',
            'placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2',
            'transition-colors',
            highlighted
              ? 'bg-amber-500/10 border-amber-500/50 focus-visible:ring-amber-500/50 focus-visible:border-amber-500'
              : 'bg-zinc-900 border-white/10 focus-visible:ring-amber-500/30 focus-visible:border-amber-500/50'
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

  // Track the last auto-set selling price to know if user has manually changed it
  const lastAutoSetPriceRef = useRef<number>(0);

  // Auto-calculate print hours based on grams used (20g = 1 hour)
  useEffect(() => {
    const calculatedHours = calculatePrintHours(inputs.gramsUsed);
    if (calculatedHours !== inputs.printHours) {
      setInput('printHours', calculatedHours);
    }
  }, [inputs.gramsUsed, inputs.printHours, setInput]);

  // Auto-set selling price to 3x if empty or if price matches previous auto-set value
  useEffect(() => {
    if (totalCost <= 0) return;

    const new3xPrice = multipliers.x3;

    // Set price if:
    // - Selling price is 0 (empty), OR
    // - Selling price equals the last auto-set price (user hasn't manually changed it)
    if (inputs.sellingPrice === 0 || inputs.sellingPrice === lastAutoSetPriceRef.current) {
      setInput('sellingPrice', new3xPrice);
      lastAutoSetPriceRef.current = new3xPrice;
    }
  }, [totalCost, multipliers.x3, inputs.sellingPrice, setInput]);

  const handlePriceSelect = (price: number) => {
    setInput('sellingPrice', price);
    lastAutoSetPriceRef.current = price;
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
        {/* Calculated Print Time - Display Only */}
        <div className="space-y-1">
          <Label className="text-sm font-medium text-zinc-500">Print Time</Label>
          <div className="flex items-center gap-2 h-10 md:h-8 px-3 rounded-md bg-zinc-800/50 border border-white/10 text-white">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-base md:text-sm">{inputs.printHours} hr</span>
            <span className="text-xs text-zinc-500 ml-auto">~20g/hr</span>
          </div>
        </div>
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
          highlighted
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
