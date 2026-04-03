'use client';

import { useState } from 'react';
import { useCalculatorStore } from '@/store/useCalculatorStore';
import { DEFAULTS } from '@/lib/constants';
import { formatIDR } from '@/lib/format';
import { Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Props {
  defaultRate: string | null;
  onSaved?: () => void;
}

export function ElectricityRateSetting({ defaultRate, onSaved }: Props) {
  const storedRate = defaultRate ? parseFloat(defaultRate) : DEFAULTS.electricityRateKwh;
  const [open, setOpen] = useState(false);
  const [rate, setRate] = useState(storedRate);
  const [saving, setSaving] = useState(false);
  const { setInput } = useCalculatorStore();

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/settings/electricityRateKwh', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: rate.toString() }),
      });
      setInput('electricityRateKwh', rate);
      setOpen(false);
      onSaved?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-sm text-zinc-400 hover:text-zinc-200 hover:border-white/20 transition-colors" />
        }
      >
        <Zap className="w-3 h-3 text-amber-500" />
        <span>{formatIDR(storedRate)}/kWh</span>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white">Electricity Rate</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-zinc-500 -mt-2">
          Set your PLN electricity tariff. Applies to all calculations.
        </p>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-sm text-zinc-400">Rate (IDR/kWh)</Label>
            <div className="relative">
              <Input
                type="number"
                autoFocus
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="bg-zinc-800 border-white/10 text-white pr-12 focus-visible:ring-amber-500/30"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                IDR
              </span>
            </div>
            <p className="text-sm text-zinc-600">
              Default: {DEFAULTS.electricityRateKwh} IDR/kWh (PLN R-1 tariff 2024)
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold"
          >
            {saving ? 'Saving...' : 'Apply Rate'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
