'use client';

import { useMemo } from 'react';
import { useCalculatorStore } from '@/store/useCalculatorStore';
import { calculate } from '@/lib/calculations';
import { formatIDR } from '@/lib/format';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

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
    </div>
  );
}
