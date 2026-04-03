import { useState, useEffect, useCallback } from 'react';
import { Plus, Package } from 'lucide-react';
import { ProductList } from '@/components/products/ProductList';
import { ProductFormDialog } from '@/components/products/ProductFormDialog';
import { useConfirm } from '@/store/useConfirmStore';
import { useToastStore } from '@/store/useToastStore';
import type { ProductWithFilament, FilamentRecord } from '@/types';
import { DEFAULTS } from '@/lib/constants';

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithFilament[]>([]);
  const [filaments, setFilaments] = useState<FilamentRecord[]>([]);
  const [electricityRate, setElectricityRate] = useState(DEFAULTS.electricityRateKwh);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingProduct, setEditingProduct] = useState<ProductWithFilament | null>(null);

  const confirmDialog = useConfirm();
  const toast = useToastStore();

  const fetchData = useCallback(async () => {
    try {
      const [productsRes, filamentsRes, rateRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/filaments'),
        fetch('/api/settings/electricityRateKwh'),
      ]);

      if (!productsRes.ok || !filamentsRes.ok) throw new Error('Failed to load data');

      const [productsData, filamentsData, rateData] = await Promise.all([
        productsRes.json(),
        filamentsRes.json(),
        rateRes.json(),
      ]);

      setProducts(productsData);
      setFilaments(filamentsData);
      if (rateData.value) {
        setElectricityRate(parseFloat(rateData.value));
      }
    } catch {
      toast.error('Failed to load data. Please refresh.');
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenCreate = () => {
    setDialogMode('create');
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (product: ProductWithFilament) => {
    setDialogMode('edit');
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleCreate = async (data: {
    name: string;
    description: string | null;
    filamentId: string | null;
    gramsUsed: number;
    printHours: number;
    overheadCost: number;
    sellingPrice: number;
  }) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create product');

      // Refetch to get calculated values
      const productsRes = await fetch('/api/products');
      setProducts(await productsRes.json());
      toast.success('Product created successfully');
    } catch {
      toast.error('Failed to create product. Please try again.');
      throw new Error('Create failed');
    }
  };

  const handleUpdate = async (data: {
    name: string;
    description: string | null;
    filamentId: string | null;
    gramsUsed: number;
    printHours: number;
    overheadCost: number;
    sellingPrice: number;
  }) => {
    if (!editingProduct) return;
    const previousProducts = products;

    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === editingProduct.id ? { ...p, ...data } : p))
    );

    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update product');

      // Refetch to get updated calculated values
      const productsRes = await fetch('/api/products');
      setProducts(await productsRes.json());
      toast.success('Product updated successfully');
    } catch {
      setProducts(previousProducts);
      toast.error('Failed to save changes. Please try again.');
      throw new Error('Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDialog({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      destructive: true,
    });

    if (!confirmed) return;

    const previousProducts = products;
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete product');
      toast.success('Product deleted');
    } catch {
      setProducts(previousProducts);
      toast.error('Failed to delete product. Please try again.');
    }
  };

  const handlePrint = async (product: ProductWithFilament) => {
    if (!product.filament) {
      toast.error('This product has no linked filament.');
      return;
    }

    const grams = product.gramsUsed;

    const confirmed = await confirmDialog({
      title: 'Print Product',
      message: `Print "${product.name}"?\n\nThis will deduct ${grams}g from the linked filament.`,
      confirmText: 'Print',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/products/${product.id}/print`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to print');
      }

      const result = await res.json();

      // Refresh data to show updated filament weights
      await fetchData();

      // Show success message
      toast.success(`Printed! Filament remaining: ${result.newRemainingWeight}g`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to print product.');
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">Product Catalog</h1>
            <p className="text-sm text-zinc-500">
              {products.length} product{products.length !== 1 ? 's' : ''} in catalog
            </p>
          </div>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 h-8 px-3 text-base bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* List */}
      <div className="rounded-2xl bg-zinc-900/30 border border-white/10 p-4">
        <ProductList
          products={products}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onPrint={handlePrint}
        />
      </div>

      {/* Dialog */}
      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        initialData={editingProduct}
        filaments={filaments}
        electricityRateKwh={electricityRate}
        onSubmit={dialogMode === 'create' ? handleCreate : handleUpdate}
      />
    </div>
  );
}