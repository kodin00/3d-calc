import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FILAMENT_MATERIALS } from '@/lib/constants';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MaterialSelect({ value, onChange, placeholder = 'Select material' }: Props) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full bg-zinc-800 border-white/10 text-white">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-zinc-900 border-white/10">
        {FILAMENT_MATERIALS.map((material) => (
          <SelectItem
            key={material}
            value={material}
            className="text-white hover:bg-zinc-800 focus:bg-zinc-800"
          >
            {material}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}