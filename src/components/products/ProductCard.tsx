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
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-3 sm:px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl hover:border-white/20 transition-colors group">
      {/* Top row: Icon, Name, Stats */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
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
          <div className="flex items-center gap-2 flex-wrap">
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
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-6 text-sm pl-11 sm:pl-0">
        {/* Material & Time */}
        <div className="text-center sm:text-center">
          <div className="text-zinc-400">{product.gramsUsed}g</div>
          <div className="text-zinc-600 text-xs">{product.printHours}h</div>
        </div>

        {/* Cost */}
        <div className="text-center sm:text-right">
          <div className="text-zinc-400 sm:font-medium truncate">
            {product.totalCost !== null ? formatIDR(product.totalCost) : '—'}
          </div>
          <div className="text-zinc-600 text-xs">cost</div>
        </div>

        {/* Price & Margin */}
        <div className="text-center sm:text-right">
          <div className="text-white font-medium truncate">{formatIDR(product.sellingPrice)}</div>
          <div className={getMarginColor(product.marginPercent) + ' text-xs'}>
            {product.marginPercent !== null ? formatPercent(product.marginPercent) : '—'} margin
          </div>
        </div>
      </div>

      {/* Actions - visible on mobile, hover on desktop */}
      <div className="flex items-center justify-end sm:justify-start gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pl-11 sm:pl-0">
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
