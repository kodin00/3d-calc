import { useToastStore, type Toast } from '@/store/useToastStore';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const styles = {
  success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  error: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  info: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
};

function ToastItem({ toast }: { toast: Toast }) {
  const dismissToast = useToastStore((s) => s.dismissToast);
  const Icon = icons[toast.type];

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 px-3.5 py-3 rounded-lg border shadow-lg',
        'animate-in slide-in-from-right-full fade-in duration-200',
        styles[toast.type]
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="text-base">{toast.message}</span>
      <button
        onClick={() => dismissToast(toast.id)}
        className="ml-auto p-0.5 rounded hover:bg-white/10 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}