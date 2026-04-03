import { useState, useEffect, useCallback } from 'react';
import { Plus, Layers } from 'lucide-react';
import { FilamentList } from '@/components/filaments/FilamentList';
import { FilamentFormDialog } from '@/components/filaments/FilamentFormDialog';
import { useConfirm } from '@/store/useConfirmStore';
import { useToastStore } from '@/store/useToastStore';
import type { FilamentRecord } from '@/types';

export default function FilamentsPage() {
  const [filaments, setFilaments] = useState<FilamentRecord[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingFilament, setEditingFilament] = useState<FilamentRecord | null>(null);

  const confirmDialog = useConfirm();
  const toast = useToastStore();

  const fetchFilaments = useCallback(async () => {
    try {
      const res = await fetch('/api/filaments');
      if (!res.ok) throw new Error('Failed to load filaments');
      setFilaments(await res.json());
    } catch {
      toast.error('Failed to load filaments. Please refresh.');
    }
  }, [toast]);

  useEffect(() => {
    fetchFilaments();
  }, [fetchFilaments]);

  const handleOpenCreate = () => {
    setDialogMode('create');
    setEditingFilament(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (filament: FilamentRecord) => {
    setDialogMode('edit');
    setEditingFilament(filament);
    setDialogOpen(true);
  };

  const handleCreate = async (data: Omit<FilamentRecord, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/filaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create filament');
      const { id } = await res.json();
      setFilaments((prev) => [
        ...prev,
        { ...data, id, createdAt: new Date().toISOString() },
      ]);
      toast.success('Filament created successfully');
    } catch {
      toast.error('Failed to create filament. Please try again.');
      throw new Error('Create failed');
    }
  };

  const handleUpdate = async (data: Omit<FilamentRecord, 'id' | 'createdAt'>) => {
    if (!editingFilament) return;
    const previousFilaments = filaments;

    // Optimistic update
    setFilaments((prev) =>
      prev.map((f) => (f.id === editingFilament.id ? { ...f, ...data } : f))
    );

    try {
      const res = await fetch(`/api/filaments/${editingFilament.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update filament');
      toast.success('Filament updated successfully');
    } catch {
      // Rollback on failure
      setFilaments(previousFilaments);
      toast.error('Failed to save changes. Please try again.');
      throw new Error('Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirmDialog({
      title: 'Delete Filament',
      message: 'Are you sure you want to delete this filament?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      destructive: true,
    });

    if (!confirmed) return;

    const previousFilaments = filaments;

    // Optimistic delete
    setFilaments((prev) => prev.filter((f) => f.id !== id));

    try {
      const res = await fetch(`/api/filaments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete filament');
      toast.success('Filament deleted');
    } catch {
      // Rollback on failure
      setFilaments(previousFilaments);
      toast.error('Failed to delete filament. Please try again.');
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center">
            <Layers className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">Filament Catalog</h1>
            <p className="text-sm text-zinc-500">
              {filaments.length} spool{filaments.length !== 1 ? 's' : ''} tracked
            </p>
          </div>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 h-8 px-3 text-base bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Filament
        </button>
      </div>

      {/* List */}
      <div className="rounded-2xl bg-zinc-900/30 border border-white/10 p-4">
        <FilamentList
          filaments={filaments}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Dialog */}
      <FilamentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        initialData={editingFilament}
        onSubmit={dialogMode === 'create' ? handleCreate : handleUpdate}
      />
    </div>
  );
}