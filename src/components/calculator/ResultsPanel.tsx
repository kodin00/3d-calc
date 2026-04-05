'use client';

import { useMemo, useState } from 'react';
import { useCalculatorStore } from '@/store/useCalculatorStore';
import { calculate } from '@/lib/calculations';
import { formatIDR } from '@/lib/format';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToastStore } from '@/store/useToastStore';

interface CostRowProps {
  label: string;
  amount: number;
  total: number;
  color?: string;
}

function CostRow({ label, amount, total, color = 'bg-amber-500' }: CostRowProps) {
  const pct = total > 0 ? (amount / total) * 100 : 0;
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">{label}</span>
        <span className="text-zinc-200 font-mono">{formatIDR(amount)}</span>
      </div>
      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

export function ResultsPanel() {
  const { inputs } = useCalculatorStore();
  const results = useMemo(() => calculate(inputs), [inputs]);
  const toast = useToastStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [productName, setProductName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddProduct = async () => {
    if (!productName.trim()) return;

    setSaving(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productName.trim(),
          description: null,
          filamentId: null,
          pricePerGram: inputs.pricePerGram,
          gramsUsed: inputs.gramsUsed,
          printHours: inputs.printHours,
          electricityRateKwh: inputs.electricityRateKwh,
          printerWatts: inputs.printerWatts,
          machineHourlyRate: inputs.machineHourlyRate,
          wasteFactorPercent: inputs.wasteFactorPercent,
          sellingPrice: inputs.sellingPrice,
          overheadCost: 0,
        }),
      });

      if (!res.ok) throw new Error('Failed to create product');

      toast.success('Product created successfully');
      setDialogOpen(false);
      setProductName('');
    } catch {
      toast.error('Failed to create product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const { materialCost, electricityCost, machineCost, totalCost, actualMarginPercent, profit } = results;
  const isGoodMargin = actualMarginPercent >= 30;
  const isPositive = actualMarginPercent > 0;

  const MarginIcon = actualMarginPercent >= 30 ? TrendingUp : actualMarginPercent > 0 ? Minus : TrendingDown;

  return (
    <div className="space-y-3">
      {/* Primary output */}
      <div className={cn(
        'rounded-xl p-4 border',
        isGoodMargin
          ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20'
          : isPositive
          ? 'bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20'
          : 'bg-gradient-to-br from-rose-500/10 to-rose-600/5 border-rose-500/20'
      )}>
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-0.5">Profit</p>
        <p className={cn(
          'text-2xl font-bold font-mono tracking-tight',
          isGoodMargin ? 'text-emerald-400' : isPositive ? 'text-yellow-400' : 'text-rose-400'
        )}>
          {formatIDR(profit)}
        </p>
        <p className="text-sm text-zinc-500 mt-0.5">selling at {formatIDR(inputs.sellingPrice)}</p>
      </div>

      {/* Margin badge */}
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border text-base',
        isGoodMargin
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          : isPositive
          ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
          : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
      )}>
        <MarginIcon className="w-3.5 h-3.5 shrink-0" />
        <span className="font-medium">{actualMarginPercent.toFixed(1)}% margin</span>
        <span className="text-sm opacity-70 ml-1">
          {isGoodMargin ? '— Healthy' : isPositive ? '— Low' : '— Below cost'}
        </span>
      </div>

      {/* Add Product Button */}
      <Button
        variant="outline"
        onClick={() => setDialogOpen(true)}
        className="w-full flex items-center justify-center gap-2 h-9 bg-zinc-800 hover:bg-zinc-700 text-white border-white/10"
      >
        <Plus className="w-4 h-4" />
        Add as Product
      </Button>

      {/* Cost breakdown */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Cost Breakdown</p>
        <CostRow label={`Material (${inputs.gramsUsed}g + ${inputs.wasteFactorPercent}% waste)`} amount={materialCost} total={totalCost} color="bg-amber-500" />
        <CostRow label="Electricity" amount={electricityCost} total={totalCost} color="bg-blue-500" />
        <CostRow label="Machine" amount={machineCost} total={totalCost} color="bg-purple-500" />
      </div>

      {/* Total cost + combined progress bar */}
      <div className="bg-zinc-900 rounded-lg border border-white/5 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm text-zinc-400">Total Cost</span>
          <span className="text-base font-semibold font-mono text-white">{formatIDR(totalCost)}</span>
        </div>
        <div className="flex h-1.5">
          {totalCost > 0 && [
            { pct: materialCost / totalCost * 100, color: 'bg-amber-500' },
            { pct: electricityCost / totalCost * 100, color: 'bg-blue-500' },
            { pct: machineCost / totalCost * 100, color: 'bg-purple-500' },
          ].map(({ pct, color }, i) => (
            <div key={i} className={cn('h-full transition-all duration-500', color)} style={{ width: `${pct}%` }} />
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Material/g', value: formatIDR(materialCost / (inputs.gramsUsed || 1)) },
          { label: 'Print cost/hr', value: formatIDR((electricityCost + machineCost) / (inputs.printHours || 1)) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-zinc-900/60 rounded-lg p-2.5 border border-white/5">
            <p className="text-xs text-zinc-500 mb-0.5">{label}</p>
            <p className="text-sm font-mono font-medium text-zinc-200">{value}</p>
          </div>
        ))}
      </div>

      {/* Add Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Product</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-sm text-zinc-400">Product Name *</Label>
              <Input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Phone Stand"
                className="bg-zinc-800 border-white/10 text-white h-10 md:h-8"
                autoFocus
              />
            </div>

            {/* Preview of values that will be saved */}
            <div className="p-3 bg-zinc-800/50 border border-white/10 rounded-lg space-y-1.5">
              <p className="text-xs text-zinc-500 mb-2">Will be saved with:</p>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Grams</span>
                <span className="text-zinc-200">{inputs.gramsUsed}g</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Print time</span>
                <span className="text-zinc-200">{inputs.printHours} hr</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Selling price</span>
                <span className="text-zinc-200">
                  {inputs.sellingPrice > 0 ? formatIDR(inputs.sellingPrice) : '-'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Total cost</span>
                <span className="text-amber-400">{formatIDR(totalCost)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1 border-white/10 text-zinc-400 hover:text-white h-10 md:h-8"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddProduct}
                disabled={!productName.trim() || saving}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold h-10 md:h-8"
              >
                {saving ? 'Saving...' : 'Add Product'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
