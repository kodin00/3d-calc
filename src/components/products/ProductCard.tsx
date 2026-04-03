import { Pencil, Trash2, Package, Printer } from 'lucide-react';
import type { ProductWithFilament } from '@/types';
import { formatIDR, formatPercent } from '@/lib/format';
import { Badge } from '@/components/ui/badge';

interface Props {
  product: ProductWithFilament;
  onEdit: (product: ProductWithFilament) => void;
  onDelete: (id: string) => void;
  onPrint: (product: ProductWithFilament) => void;
}

function getMarginColor(margin: number | null): string {
  if (margin === null) return 'text-zinc-500';
  if (margin >= 30) return 'text-emerald-400';
  if (margin >= 15) return 'text-amber-400';
  return 'text-rose-400';
}

export function ProductCard({ product, onEdit, onDelete, onPrint }: Props) {
  const canPrint = product.filamentId && product.filament;

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl hover:border-white/20 transition-colors group">
      {/* Filament color or package icon */}
      <div className="w-8 h-8 rounded-lg border border-white/20 shrink-0 flex items-center justify-center">
        {product.filament ? (
          <div
            className="w-6 h-6 rounded"
            style={{ backgroundColor: product.filament.color }}
            title={product.filament.name}
          />
        ) : (
          <Package className="w-4 h-4 text-zinc-600" />
        )}
      </div>

      {/* Name and description */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-white truncate">
            {product.name}
          </span>
          {product.filament && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
              {product.filament.material}
            </Badge>
          )}
          {product.printCount > 0 && (
            <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 text-zinc-400">
              {product.printCount} printed
            </Badge>
          )}
        </div>
        <div className="text-sm text-zinc-500 truncate">
          {product.filament ? product.filament.name : 'No filament linked'}
          {product.description && ` · ${product.description}`}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm">
        {/* Material & Time */}
        <div className="w-20 text-center">
          <div className="text-zinc-400">{product.gramsUsed}g</div>
          <div className="text-zinc-600">{product.printHours}h</div>
        </div>

        {/* Cost */}
        <div className="w-24 text-right">
          <div className="text-zinc-400">
            {product.totalCost !== null ? formatIDR(product.totalCost) : '—'}
          </div>
          <div className="text-zinc-600">cost</div>
        </div>

        {/* Price & Margin */}
        <div className="w-28 text-right">
          <div className="text-white font-medium">{formatIDR(product.sellingPrice)}</div>
          <div className={getMarginColor(product.marginPercent)}>
            {product.marginPercent !== null ? formatPercent(product.marginPercent) : '—'} margin
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {canPrint && (
          <button
            onClick={() => onPrint(product)}
            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-emerald-400 transition-colors"
            title="Print this product (deducts filament weight)"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={() => onEdit(product)}
          className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-amber-400 transition-colors"
          title="Edit product"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-500 hover:text-rose-400 transition-colors"
          title="Delete product"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}