import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Carregando...' }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      p: 4,
      gap: 2,
    }}
  >
    <CircularProgress />
    <Typography color="text.secondary" variant="body2">
      {message}
    </Typography>
  </Box>
);