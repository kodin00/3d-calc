import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MaterialSelect } from './MaterialSelect';
import type { FilamentRecord } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  initialData?: FilamentRecord | null;
  onSubmit: (data: Omit<FilamentRecord, 'id' | 'createdAt'>) => Promise<void>;
}

interface FormData {
  name: string;
  brand: string;
  color: string;
  material: string;
  costPerKg: string;
  spoolWeightG: string;
  remainingWeightG: string;
  notes: string;
}

const defaultFormData: FormData = {
  name: '',
  brand: '',
  color: '#FF5733',
  material: 'PLA',
  costPerKg: '180000',
  spoolWeightG: '1000',
  remainingWeightG: '1000',
  notes: '',
};

export function FilamentFormDialog({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
}: Props) {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        setFormData({
          name: initialData.name,
          brand: initialData.brand,
          color: initialData.color,
          material: initialData.material,
          costPerKg: String(initialData.costPerKg),
          spoolWeightG: String(initialData.spoolWeightG),
          remainingWeightG: String(initialData.remainingWeightG),
          notes: initialData.notes || '',
        });
      } else {
        setFormData(defaultFormData);
      }
    }
  }, [open, mode, initialData]);

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.brand.trim() || !formData.material) {
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        color: formData.color,
        material: formData.material,
        costPerKg: parseFloat(formData.costPerKg) || 0,
        spoolWeightG: parseFloat(formData.spoolWeightG) || 1000,
        remainingWeightG: parseFloat(formData.remainingWeightG) || 0,
        notes: formData.notes.trim() || null,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            {mode === 'create' ? 'Add Filament' : 'Edit Filament'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g. Basic Red PLA"
                className="bg-zinc-800 border-white/10 text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Brand *</Label>
              <Input
                value={formData.brand}
                onChange={(e) => updateField('brand', e.target.value)}
                placeholder="e.g. eSun"
                className="bg-zinc-800 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => updateField('color', e.target.value)}
                  className="w-8 h-8 rounded border border-white/10 cursor-pointer"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => updateField('color', e.target.value)}
                  className="bg-zinc-800 border-white/10 text-white flex-1"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Material *</Label>
              <MaterialSelect
                value={formData.material}
                onChange={(v) => updateField('material', v)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Cost per kg (IDR)</Label>
              <Input
                type="number"
                value={formData.costPerKg}
                onChange={(e) => updateField('costPerKg', e.target.value)}
                className="bg-zinc-800 border-white/10 text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Spool weight (g)</Label>
              <Input
                type="number"
                value={formData.spoolWeightG}
                onChange={(e) => updateField('spoolWeightG', e.target.value)}
                className="bg-zinc-800 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Remaining weight (g)</Label>
              <Input
                type="number"
                value={formData.remainingWeightG}
                onChange={(e) => updateField('remainingWeightG', e.target.value)}
                className="bg-zinc-800 border-white/10 text-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Optional"
                className="bg-zinc-800 border-white/10 text-white"
              />
            </div>
          </div>

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
              disabled={!formData.name.trim() || !formData.brand.trim() || saving}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold"
            >
              {saving ? 'Saving...' : mode === 'create' ? 'Add Filament' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}