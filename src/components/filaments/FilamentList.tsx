import { Layers } from 'lucide-react';
import type { FilamentRecord } from '@/types';
import { FilamentCard } from './FilamentCard';

interface Props {
  filaments: FilamentRecord[];
  onEdit: (filament: FilamentRecord) => void;
  onDelete: (id: string) => void;
}

export function FilamentList({ filaments, onEdit, onDelete }: Props) {
  if (filaments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-4">
          <Layers className="w-6 h-6 text-zinc-600" />
        </div>
        <p className="text-sm text-zinc-500">No filaments added yet.</p>
        <p className="text-xs text-zinc-600 mt-1">
          Click "Add Filament" to track your spool inventory.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filaments.map((filament) => (
        <FilamentCard
          key={filament.id}
          filament={filament}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}