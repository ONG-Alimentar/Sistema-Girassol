import { createTheme } from '@mui/material/styles'

// Identidade visual do Sistema Girassol (paleta dos wireframes): marrom terroso
// + creme + amarelo girassol. Este theme é a fundação das telas do RBAC (#3) e
// do shell (#30) — use tokens do theme (palette/shape) em vez de cores soltas.
const BROWN = '#5B3A21' // marrom principal (botões, títulos)
const BROWN_DARK = '#4A2F17' // texto/variações escuras
const SUNFLOWER = '#F2B705' // amarelo girassol
const CREAM_BG = '#F4E9CC' // fundo creme da aplicação
const CREAM_PAPER = '#FBF6E9' // superfícies (campos, cards)

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
    // Campos arredondados e com fundo "paper", como no wireframe.
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
