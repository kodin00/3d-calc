import type { FilamentRecord } from '@/types';
import { formatIDR } from '@/lib/format';

interface Props {
  value: string;
  onChange: (value: string) => void;
  filaments: FilamentRecord[];
}

export function FilamentSelect({ value, onChange, filaments }: Props) {
  const selectedFilament = filaments.find(f => f.id === value);

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 px-3 bg-zinc-800 border border-white/10 text-white rounded-md text-base appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500"
      >
        <option value="">No filament</option>
        {filaments.map((filament) => (
          <option key={filament.id} value={filament.id}>
            {filament.name} ({filament.brand}) - {formatIDR(filament.costPerKg)}/kg
          </option>
        ))}
      </select>

      {/* Custom display showing color swatch */}
      {selectedFilament && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
          <div
            className="w-3 h-3 rounded-sm border border-white/20"
            style={{ backgroundColor: selectedFilament.color }}
          />
        </div>
      )}

      {/* Chevron */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}