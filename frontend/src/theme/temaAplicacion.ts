import { createTheme } from '@mui/material/styles';
import { DISENO } from '../config/diseno.config';

const c = DISENO.colores;

/** Tema MUI: modificar aquí la apariencia transversal de todos los módulos. */
export const temaAplicacion = createTheme({
  palette: {
    primary: { main: c.guinda, dark: c.guindaOscuro, light: c.guindaClaro, contrastText: '#FFFFFF' },
    secondary: { main: c.dorado },
    background: { default: c.fondo, paper: c.papel },
    text: { primary: c.texto, secondary: c.textoSecundario },
    divider: c.borde,
    success: { main: '#237444' },
    warning: { main: '#A56914' },
    error: { main: '#B3261E' },
  },
  typography: {
    fontFamily: '"Noto Sans", "Segoe UI", Arial, sans-serif',
    h4: { fontSize: '1.45rem', fontWeight: 750, letterSpacing: '-0.02em' },
    h5: { fontSize: '1.2rem', fontWeight: 700 },
    h6: { fontSize: '1.03rem', fontWeight: 700 },
    subtitle1: { fontWeight: 650 },
    button: { textTransform: 'none', fontWeight: 650 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { margin: 0 } } },
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 8 } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiCard: { styleOverrides: { root: { border: `1px solid ${c.borde}`, boxShadow: 'none' } } },
    MuiTextField: { defaultProps: { size: 'small', variant: 'outlined' } },
    MuiOutlinedInput: { styleOverrides: { root: { backgroundColor: c.papel } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 9 } } },
  },
});
