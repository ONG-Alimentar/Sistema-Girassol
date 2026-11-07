import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

interface ConfirmDialogProps {
  open: boolean;
  options: ConfirmDialogOptions;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, options, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{options.title || 'Confirmação'}</DialogTitle>
      <DialogContent>
        <DialogContentText>{options.message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="inherit">
          {options.cancelText || 'Cancelar'}
        </Button>
        <Button onClick={onConfirm} color={options.color || 'error'} variant="contained" autoFocus>
          {options.confirmText || 'Confirmar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
