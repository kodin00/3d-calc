import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { CalculatorForm } from '@/components/calculator/CalculatorForm';
import { ResultsPanel } from '@/components/calculator/ResultsPanel';
import { SavedPresetsPanel } from '@/components/calculator/SavedPresetsPanel';
import { ElectricityRateSetting } from '@/components/calculator/ElectricityRateSetting';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCalculatorStore } from '@/store/useCalculatorStore';
import { calculate } from '@/lib/calculations';
import { useToastStore } from '@/store/useToastStore';
import { formatIDR } from '@/lib/format';
import type { Preset } from '@/types';

export default function CalculatorPage() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [electricityRate, setElectricityRate] = useState<string | null>(null);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [productName, setProductName] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);

  const { inputs } = useCalculatorStore();
  const { totalCost } = calculate(inputs);
  const toast = useToastStore();

  const fetchData = useCallback(async () => {
    try {
      const [presetsRes, rateRes] = await Promise.all([
        fetch('/api/presets'),
        fetch('/api/settings/electricityRateKwh'),
      ]);
      if (!presetsRes.ok || !rateRes.ok) throw new Error('Failed to fetch data');
      setPresets(await presetsRes.json());
      const rateData = await rateRes.json();
      setElectricityRate(rateData.value ?? null);
    } catch {
      toast.error('Failed to load calculator data');
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddProduct = async () => {
    if (!productName.trim()) return;

    setSavingProduct(true);
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
      setAddProductOpen(false);
      setProductName('');
    } catch {
      toast.error('Failed to create product. Please try again.');
    } finally {
      setSavingProduct(false);
    }
  };

  return (
    <div className="p-3 md:p-4 space-y-3 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-lg md:text-xl font-bold text-white leading-tight">Cost Calculator</h1>
          <p className="text-xs md:text-sm text-zinc-500">Calculate print costs &amp; pricing</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setAddProductOpen(true)}
            className="flex items-center gap-1.5 h-9 md:h-8 px-3 text-sm bg-zinc-800 hover:bg-zinc-700 text-white border-white/10"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add new product?</span>
            <span className="sm:hidden">Add Product</span>
          </Button>
          <ElectricityRateSetting defaultRate={electricityRate} onSaved={fetchData} />
        </div>
      </div>

      {/* Presets */}
      <SavedPresetsPanel initialPresets={presets} onRefetch={fetchData} />

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <div className="rounded-2xl bg-zinc-900/50 border border-white/10 p-3 md:p-4">
          <CalculatorForm />
        </div>
        <div className="rounded-2xl bg-zinc-900/50 border border-white/10 p-3 md:p-4">
          <h2 className="text-sm md:text-base font-semibold text-zinc-300 uppercase tracking-wider mb-3">Results</h2>
          <ResultsPanel />
        </div>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
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
                onClick={() => setAddProductOpen(false)}
                className="flex-1 border-white/10 text-zinc-400 hover:text-white h-10 md:h-8"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddProduct}
                disabled={!productName.trim() || savingProduct}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold h-10 md:h-8"
              >
                {savingProduct ? 'Saving...' : 'Add Product'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
