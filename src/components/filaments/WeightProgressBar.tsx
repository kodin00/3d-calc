interface Props {
  remaining: number;
  total: number;
  className?: string;
}

export function WeightProgressBar({ remaining, total, className = '' }: Props) {
  const percent = total > 0 ? Math.min(100, Math.max(0, (remaining / total) * 100)) : 0;

  const getColor = () => {
    if (percent > 50) return 'bg-emerald-500';
    if (percent > 25) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${getColor()}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-sm text-zinc-500 w-10 text-right">
        {percent.toFixed(0)}%
      </span>
    </div>
  );
}