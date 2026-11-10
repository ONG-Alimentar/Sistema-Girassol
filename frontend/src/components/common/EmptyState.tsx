import { Box, Typography, Button } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'Nenhum registro encontrado',
  description = 'Não há dados disponíveis para exibição no momento.',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        textAlign: 'center',
        gap: 1,
      }}
    >
      <InboxOutlinedIcon sx={{ fontSize: 60, color: 'text.disabled' }} />
      <Typography variant="h6" color="text.primary">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
        {description}
      </Typography>
      {actionLabel && onAction && (
        <Button variant="contained" color="primary" onClick={onAction} sx={{ mt: 2 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
