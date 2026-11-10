import { useState, useCallback, useRef } from 'react';
import type { ConfirmDialogOptions } from '../components/common/ConfirmDialog.tsx';

export function useConfirm() {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions>({ message: '' });
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((dialogOptions: ConfirmDialogOptions): Promise<boolean> => {
    // Se já houver uma confirmação pendente, resolve a anterior como falsa antes de abrir a nova
    if (resolverRef.current) {
      resolverRef.current(false);
    }

    setOptions(dialogOptions);
    setOpen(true);
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    setOpen(false);
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  };

  const handleCancel = () => {
    setOpen(false);
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  };

  return {
    confirm,
    confirmDialogProps: {
      open,
      options,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    },
  };
}
