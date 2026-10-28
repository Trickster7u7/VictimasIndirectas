import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { Breadcrumbs, Link as MuiLink, Stack, Typography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { TITULOS_RUTA } from './navegacion.config';
import { obtenerRutaUsuario } from '../../modules/auth/application/obtenerRutaUsuario';
import { usarAutenticacion } from '../../modules/auth/application/usarAutenticacion';

export function NavegacionPagina() {
  const { pathname } = useLocation();
  const { usuario } = usarAutenticacion();
  const inicioUsuario = usuario ? obtenerRutaUsuario(usuario.estado) : '/';
  const titulo = TITULOS_RUTA[pathname] ?? 'Sección';
  return (
    <Stack spacing={1.5} sx={{ mb: 2.5 }}>
      <Breadcrumbs separator="›" aria-label="Ruta de navegación">
        <MuiLink component={Link} underline="hover" to={inicioUsuario} color="primary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 12 }}><HomeOutlinedIcon sx={{ fontSize: 17 }} /> Inicio</MuiLink>
        {pathname !== inicioUsuario && <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.primary' }}>{titulo}</Typography>}
      </Breadcrumbs>
      <Typography variant="h4" component="h1">{titulo}</Typography>
    </Stack>
  );
}
