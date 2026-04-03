'use client';

import { useState } from 'react';
import { useCalculatorStore } from '@/store/useCalculatorStore';
import { DEFAULTS } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  initialRate: number;
  onSaved?: () => void;
}

export function SettingsForm({ initialRate, onSaved }: Props) {
  const [rate, setRate] = useState(initialRate);
  const [saved, setSaved] = useState(false);
  const { setInput } = useCalculatorStore();

  const handleSave = async () => {
    await fetch('/api/settings/electricityRateKwh', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: rate.toString() }),
    });
    setInput('electricityRateKwh', rate);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onSaved?.();
  };

  return (
    <div className="rounded-2xl bg-zinc-900/50 border border-white/10 p-5 space-y-4">
      <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
        Electricity
      </h2>

      <div className="space-y-1.5">
        <Label className="text-xs text-zinc-400">
          PLN Electricity Rate
          <span className="text-zinc-600 font-normal ml-1">(IDR/kWh)</span>
        </Label>
        <div className="relative">
          <Input
            type="number"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
            className="bg-zinc-900 border-white/10 text-white pr-16 focus-visible:ring-amber-500/30 focus-visible:border-amber-500/50"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
            IDR/kWh
          </span>
        </div>
        <p className="text-xs text-zinc-600">
          Indonesian PLN default: {DEFAULTS.electricityRateKwh} IDR/kWh
        </p>
      </div>

      <Button
        onClick={handleSave}
        className={saved
          ? 'w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold'
          : 'w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold'
        }
      >
        {saved ? (
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Saved!
          </span>
        ) : (
          'Save Settings'
        )}
      </Button>
    </div>
  );
}
