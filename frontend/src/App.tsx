import { CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ptBR } from '@mui/x-date-pickers/locales';
import 'dayjs/locale/pt-br';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './AppRoutes.tsx';
import { AuthProvider } from './auth/AuthProvider.tsx';
import { ToastProvider } from './context/ToastProvider.tsx';
import { theme } from './theme.ts';

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        adapterLocale="pt-br"
        localeText={ptBR.components.MuiLocalizationProvider.defaultProps.localeText}
      >
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <ToastProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </ToastProvider>
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
