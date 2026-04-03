import { useConfirmStore } from '@/store/useConfirmStore';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function ConfirmDialog() {
  const { state, resolve } = useConfirmStore();
  const { isOpen, options } = state;

  if (!isOpen) return null;

  const handleConfirm = () => resolve(true);
  const handleCancel = () => resolve(false);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && resolve(false)}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {options.destructive && (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            {options.title ?? 'Confirm'}
          </DialogTitle>
          <DialogDescription className="whitespace-pre-wrap">
            {options.message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {options.cancelText !== undefined && (
            <Button variant="outline" onClick={handleCancel}>
              {options.cancelText ?? 'Cancel'}
            </Button>
          )}
          <Button
            variant={options.destructive ? 'destructive' : 'default'}
            onClick={handleConfirm}
          >
            {options.confirmText ?? 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}