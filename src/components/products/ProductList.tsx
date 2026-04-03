import { Package } from 'lucide-react';
import type { ProductWithFilament } from '@/types';
import { ProductCard } from './ProductCard';

interface Props {
  products: ProductWithFilament[];
  onEdit: (product: ProductWithFilament) => void;
  onDelete: (id: string) => void;
  onPrint: (product: ProductWithFilament) => void;
}

export function ProductList({ products, onEdit, onDelete, onPrint }: Props) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-4">
          <Package className="w-6 h-6 text-zinc-600" />
        </div>
        <p className="text-base text-zinc-500">No products added yet.</p>
        <p className="text-sm text-zinc-600 mt-1">
          Click "Add Product" to build your product catalog.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          onPrint={onPrint}
        />
      ))}
    </div>
  );
}