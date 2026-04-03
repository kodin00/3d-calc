'use client';

import { useState } from 'react';
import { useCalculatorStore } from '@/store/useCalculatorStore';
import type { Preset } from '@/types';
import { Plus, Trash2, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  initialPresets: Preset[];
  onRefetch: () => void;
}

export function SavedPresetsPanel({ initialPresets, onRefetch }: Props) {
  const [presets, setPresets] = useState<Preset[]>(initialPresets);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [saving, setSaving] = useState(false);
  const { inputs, setInputs } = useCalculatorStore();

  const handleSave = async () => {
    if (!presetName.trim()) return;
    setSaving(true);
    try {
      await fetch('/api/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: presetName.trim(), inputs }),
      });
      setPresets((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}`,
          name: presetName.trim(),
          inputsJson: JSON.stringify(inputs),
          createdAt: new Date().toISOString(),
        },
      ]);
      setPresetName('');
      setDialogOpen(false);
      onRefetch();
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = (preset: Preset) => {
    try {
      const parsed = JSON.parse(preset.inputsJson);
      setInputs(parsed);
    } catch {}
  };

  const handleDelete = async (id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
    await fetch(`/api/presets/${id}`, { method: 'DELETE' });
    onRefetch();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bookmark className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
            Saved Presets
          </span>
          {presets.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 font-medium">
              {presets.length}
            </span>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger className="flex items-center gap-1 h-7 px-2 text-sm text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-md transition-colors">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Save current
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-white">Save Preset</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-sm text-zinc-400">Preset Name</Label>
                <Input
                  autoFocus
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  placeholder="e.g. PLA Standard Print"
                  className="bg-zinc-800 border-white/10 text-white focus-visible:ring-amber-500/30"
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={!presetName.trim() || saving}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold"
              >
                {saving ? 'Saving...' : 'Save Preset'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {presets.length === 0 ? (
        <p className="text-sm text-zinc-600 py-2">No presets saved yet.</p>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center gap-2 shrink-0 px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg hover:border-amber-500/30 transition-colors group cursor-pointer"
              onClick={() => handleLoad(preset)}
            >
              <span className="text-sm text-zinc-300 whitespace-nowrap max-w-[140px] truncate">
                {preset.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(preset.id);
                }}
                className="text-zinc-700 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
