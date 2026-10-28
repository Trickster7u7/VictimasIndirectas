import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';

import App from './App';
import { ProveedorAutenticacion } from './modules/auth/application/AuthContext';
import { temaAplicacion } from './theme/temaAplicacion';

import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={temaAplicacion}>
      <CssBaseline />

      <HashRouter>
        <ProveedorAutenticacion>
          <App />
        </ProveedorAutenticacion>
      </HashRouter>

    </ThemeProvider>
  </StrictMode>
);