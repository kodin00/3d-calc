import { Pencil, Trash2 } from 'lucide-react';
import type { FilamentRecord } from '@/types';
import { formatIDR, formatGrams } from '@/lib/format';
import { WeightProgressBar } from './WeightProgressBar';
import { Badge } from '@/components/ui/badge';

interface Props {
  filament: FilamentRecord;
  onEdit: (filament: FilamentRecord) => void;
  onDelete: (id: string) => void;
}

export function FilamentCard({ filament, onEdit, onDelete }: Props) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl hover:border-white/20 transition-colors group">
      {/* Color swatch */}
      <div
        className="w-8 h-8 rounded-lg border border-white/20 shrink-0"
        style={{ backgroundColor: filament.color }}
        title={filament.color}
      />

      {/* Name and brand */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-white truncate">
            {filament.name}
          </span>
          <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
            {filament.material}
          </Badge>
        </div>
        <span className="text-sm text-zinc-500">{filament.brand}</span>
      </div>

      {/* Weight progress */}
      <div className="w-32 shrink-0">
        <WeightProgressBar
          remaining={filament.remainingWeightG}
          total={filament.spoolWeightG}
        />
        <div className="text-xs text-zinc-600 mt-0.5 text-center">
          {formatGrams(filament.remainingWeightG)} / {formatGrams(filament.spoolWeightG)}
        </div>
      </div>

      {/* Cost */}
      <div className="w-24 shrink-0 text-right">
        <span className="text-sm text-zinc-400">{formatIDR(filament.costPerKg)}/kg</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(filament)}
          className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-amber-400 transition-colors"
          title="Edit filament"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(filament.id)}
          className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-rose-400 transition-colors"
          title="Delete filament"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}