import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Ocorreu um erro',
  message = 'Não foi possível carregar as informações. Tente novamente mais tarde.',
  onRetry,
}) => (
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
    <ErrorIcon color="error" sx={{ fontSize: 60 }} />
    <Typography variant="h6" color="error">
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
      {message}
    </Typography>
    {onRetry && (
      <Button variant="outlined" color="primary" onClick={onRetry} sx={{ mt: 2 }}>
        Tentar Novamente
      </Button>
    )}
  </Box>
);