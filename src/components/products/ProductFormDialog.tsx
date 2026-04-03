import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FilamentSelect } from './FilamentSelect';
import { useProductFormStore } from '@/store/useProductFormStore';
import { formatIDR, formatPercent } from '@/lib/format';
import type { ProductWithFilament, FilamentRecord } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialData?: ProductWithFilament | null;
  filaments: FilamentRecord[];
  electricityRateKwh: number;
  onSubmit: (data: {
    name: string;
    description: string | null;
    filamentId: string | null;
    gramsUsed: number;
    printHours: number;
    overheadCost: number;
    sellingPrice: number;
  }) => Promise<void>;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  mode,
  initialData,
  filaments,
  electricityRateKwh,
  onSubmit,
}: Props) {
  const [saving, setSaving] = useState(false);
  const {
    name,
    description,
    filamentId,
    gramsUsed,
    printHours,
    overheadCost,
    sellingPrice,
    setField,
    setFilaments,
    setElectricityRate,
    reset,
    getPreview,
  } = useProductFormStore();

  // Initialize form when dialog opens
  useEffect(() => {
    if (open) {
      setFilaments(filaments);
      setElectricityRate(electricityRateKwh);

      if (mode === 'edit' && initialData) {
        setField('name', initialData.name);
        setField('description', initialData.description || '');
        setField('filamentId', initialData.filamentId || '');
        setField('gramsUsed', String(initialData.gramsUsed));
        setField('printHours', String(initialData.printHours));
        setField('overheadCost', String(initialData.overheadCost ?? 0));
        setField('sellingPrice', String(initialData.sellingPrice));
      } else {
        reset();
      }
    }
  }, [open, mode, initialData, filaments, electricityRateKwh, setFilaments, setElectricityRate, setField, reset]);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || null,
        filamentId: filamentId || null,
        gramsUsed: parseFloat(gramsUsed) || 0,
        printHours: parseFloat(printHours) || 0,
        overheadCost: parseFloat(overheadCost) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const preview = getPreview();

  // Validation: require positive values
  const grams = parseFloat(gramsUsed);
  const hours = parseFloat(printHours);
  const price = parseFloat(sellingPrice);
  const isValid = name.trim() && grams > 0 && hours > 0 && price > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">
            {mode === 'create' ? 'Add Product' : 'Edit Product'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-sm text-zinc-400">Name *</Label>
            <Input
              value={name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="e.g. Phone Stand"
              className="bg-zinc-800 border-white/10 text-white"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-sm text-zinc-400">Description</Label>
            <Input
              value={description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Optional notes"
              className="bg-zinc-800 border-white/10 text-white"
            />
          </div>

          {/* Filament */}
          <div className="space-y-1.5">
            <Label className="text-sm text-zinc-400">Filament (optional)</Label>
            <FilamentSelect
              value={filamentId}
              onChange={(v) => setField('filamentId', v ?? '')}
              filaments={filaments}
            />
          </div>

          {/* Grams and Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm text-zinc-400">Grams used *</Label>
              <Input
                type="number"
                value={gramsUsed}
                onChange={(e) => setField('gramsUsed', e.target.value)}
                className="bg-zinc-800 border-white/10 text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-zinc-400">Print hours *</Label>
              <Input
                type="number"
                step="0.5"
                value={printHours}
                onChange={(e) => setField('printHours', e.target.value)}
                className="bg-zinc-800 border-white/10 text-white"
              />
            </div>
          </div>

          {/* Overhead and Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm text-zinc-400">Overhead (IDR)</Label>
              <Input
                type="number"
                value={overheadCost}
                onChange={(e) => setField('overheadCost', e.target.value)}
                placeholder="0"
                className="bg-zinc-800 border-white/10 text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-zinc-400">Selling price (IDR) *</Label>
              <Input
                type="number"
                value={sellingPrice}
                onChange={(e) => setField('sellingPrice', e.target.value)}
                className="bg-zinc-800 border-white/10 text-white"
              />
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div className="p-3 bg-zinc-800/50 border border-white/10 rounded-lg">
              <div className="text-sm text-zinc-500 mb-2">Cost Preview</div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="text-zinc-400">Material</div>
                  <div className="text-white">{formatIDR(preview.materialCost)}</div>
                </div>
                <div>
                  <div className="text-zinc-400">Electricity</div>
                  <div className="text-white">{formatIDR(preview.electricityCost)}</div>
                </div>
                <div>
                  <div className="text-zinc-400">Machine</div>
                  <div className="text-white">{formatIDR(preview.machineCost)}</div>
                </div>
                <div>
                  <div className="text-zinc-400">Waste</div>
                  <div className="text-white">{formatIDR(preview.wasteCost)}</div>
                </div>
                <div>
                  <div className="text-zinc-400">Overhead</div>
                  <div className="text-white">{formatIDR(preview.overheadCost)}</div>
                </div>
                <div>
                  <div className="text-zinc-400">Total</div>
                  <div className="text-amber-400 font-medium">{formatIDR(preview.totalCost)}</div>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-white/10 flex justify-between text-sm">
                <span className="text-zinc-400">Profit</span>
                <span className="text-emerald-400 font-medium">{formatIDR(preview.profit)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Margin</span>
                <span className={`font-medium ${preview.marginPercent >= 30 ? 'text-emerald-400' : preview.marginPercent >= 15 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {formatPercent(preview.marginPercent)}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-white/10 text-zinc-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || saving}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold"
            >
              {saving ? 'Saving...' : mode === 'create' ? 'Add Product' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}