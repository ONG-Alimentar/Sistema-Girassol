import { useState } from 'react';
import type { ReactNode, SyntheticEvent } from 'react';
import { Snackbar, Alert } from '@mui/material';
import type { AlertColor, SnackbarCloseReason } from '@mui/material';
import { ToastContext } from './toast-context.ts';

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('success');

  const showToast = (msg: string, type: AlertColor = 'success') => {
    setMessage(msg);
    setSeverity(type);
    setOpen(true);
  };

  const handleClose = (
    _event?: SyntheticEvent | Event | null,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}
