import { create } from 'zustand';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

interface ConfirmState {
  isOpen: boolean;
  options: ConfirmOptions;
  resolve: ((value: boolean) => void) | null;
}

interface ConfirmStore {
  state: ConfirmState;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  resolve: (value: boolean) => void;
  close: () => void;
}

export const useConfirmStore = create<ConfirmStore>((set, get) => ({
  state: {
    isOpen: false,
    options: { message: '' },
    resolve: null,
  },

  confirm: async (options) => {
    return new Promise<boolean>((resolve) => {
      set({
        state: {
          isOpen: true,
          options,
          resolve,
        },
      });
    });
  },

  resolve: (value) => {
    const { state } = get();
    state.resolve?.(value);
    set({
      state: {
        isOpen: false,
        options: { message: '' },
        resolve: null,
      },
    });
  },

  close: () => {
    set({
      state: {
        isOpen: false,
        options: { message: '' },
        resolve: null,
      },
    });
  },
}));

// Convenience hook for using confirm
export function useConfirm() {
  const confirm = useConfirmStore((s) => s.confirm);
  return confirm;
}

// Convenience hook for using alert
export function useAlert() {
  const confirm = useConfirmStore((s) => s.confirm);

  const alert = async (message: string, title?: string) => {
    await confirm({
      message,
      title: title ?? 'Notice',
      confirmText: 'OK',
      cancelText: undefined,
    });
  };

  return alert;
}