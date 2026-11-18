import { createTheme } from '@mui/material/styles'

const BROWN = '#5B3A21'
const BROWN_DARK = '#4A2F17'
const SUNFLOWER = '#F2B705'
const AMBER = '#E9A83C'
const CREAM_BG = '#F4E9CC'
const CREAM_PAPER = '#FBF6E9'

export const theme = createTheme({
  palette: {
    primary: { main: BROWN, contrastText: '#FFFFFF' },
    secondary: { main: SUNFLOWER, contrastText: BROWN_DARK },
    background: { default: CREAM_BG, paper: CREAM_PAPER },
    text: { primary: BROWN_DARK, secondary: '#6B5436' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: ['system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'].join(','),
    h1: { fontWeight: 800, color: BROWN },
    h2: { fontWeight: 800, color: BROWN },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999 },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'default' },
      styleOverrides: {
        root: { backgroundColor: AMBER, color: BROWN_DARK },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundColor: CREAM_PAPER, border: `1px solid ${AMBER}33` },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', fullWidth: true },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { backgroundColor: CREAM_PAPER, borderRadius: 14 },
      },
    },
  },
})
