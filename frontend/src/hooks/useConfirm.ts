import { useState, useCallback } from 'react';
import type { ConfirmDialogOptions } from '../components/common/ConfirmDialog';

export const useConfirm = () => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmDialogOptions>({ message: '' });
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((dialogOptions: ConfirmDialogOptions): Promise<boolean> => {
    setOptions(dialogOptions);
    setOpen(true);
    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    setOpen(false);
    if (resolver) resolver(true);
  };

  const handleCancel = () => {
    setOpen(false);
    if (resolver) resolver(false);
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
};