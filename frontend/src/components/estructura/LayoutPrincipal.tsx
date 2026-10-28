import { useState } from 'react';
import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { ALTO_ENCABEZADO, DISENO } from '../../config/diseno.config';
import { usarAutenticacion } from '../../modules/auth/application/usarAutenticacion';
import { BarraLateral } from './BarraLateral';
import { EncabezadoAplicacion } from './EncabezadoAplicacion';
import { NavegacionPagina } from './NavegacionPagina';
import { PiePagina } from './PiePagina';

/** Solo estructura y presentación. Las guardas de rutas resuelven los permisos. */
export function LayoutPrincipal() {
  const tema = useTheme();
  const esMovil = useMediaQuery(tema.breakpoints.down('md'));
  const { usuario } = usarAutenticacion();
  const [expandido, establecerExpandido] = useState(true);
  const [movilAbierto, establecerMovilAbierto] = useState(false);
  if (!usuario) return null;
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <EncabezadoAplicacion alternarMenu={() => esMovil ? establecerMovilAbierto((valor) => !valor) : establecerExpandido((valor) => !valor)} />
      <Box sx={{ display: 'flex', minHeight: '100vh', pt: `${ALTO_ENCABEZADO}px` }}>
        <BarraLateral esMovil={esMovil} abierto={esMovil ? movilAbierto : expandido} estadoUsuario={usuario.estado} alCerrar={() => establecerMovilAbierto(false)} />
        <Box component="main" id="contenido-principal" sx={{ flexGrow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Container maxWidth={false} sx={{ maxWidth: DISENO.estructura.anchoContenido, width: '100%', flexGrow: 1, py: { xs: 2.2, sm: 3 }, px: { xs: 2, sm: 3, lg: 4 } }}>
            <NavegacionPagina />
            <Outlet />
          </Container>
          <PiePagina />
        </Box>
      </Box>
    </Box>
  );
}
