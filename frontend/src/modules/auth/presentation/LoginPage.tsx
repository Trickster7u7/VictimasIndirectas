import { Navigate } from 'react-router-dom';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import { Alert, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { usarAutenticacion } from '../application/usarAutenticacion';
import { obtenerRutaUsuario } from '../application/obtenerRutaUsuario';
import { RECURSOS } from '../../../config/recursos';
import { CONFIGURACION_APLICACION } from '../../../config/aplicacion.config';
import { PantallaCarga } from '../../../components/comunes/PantallaCarga';

/** El acceso no utiliza el layout privado ni inventa un flujo OAuth en el frontend. */
export function PaginaInicioSesion() {
  const { usuario, iniciarSesion, autenticado, cargando, error } = usarAutenticacion();
  if (cargando) return <PantallaCarga mensaje="Validando sesión con Llave MX..." />;
  if (autenticado && usuario) return <Navigate to={obtenerRutaUsuario(usuario.estado)} replace />;

  return (
    <Box component="main" sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(300px, 1fr) minmax(400px, 1fr)' } }}>
      <Stack sx={{ bgcolor: 'primary.main', color: 'white', minHeight: { xs: 230, md: '100vh' }, p: { xs: 3, md: 7 }, justifyContent: 'center', alignItems: 'flex-start', backgroundImage: `linear-gradient(115deg, #611232D9, #450C27EC), url(${RECURSOS.fondos.sndif.decorativo})`, backgroundSize: 'cover', backgroundPosition: 'center' }} spacing={3}>
        <Box component="img" alt="Gobierno de México" src={RECURSOS.logos.gobierno} sx={{ width: { xs: 185, md: 240 }, maxHeight: 76, objectFit: 'contain', objectPosition: 'left center' }} />
        <Box><Typography variant="overline" sx={{ opacity: 0.86 }}>Sistema Nacional DIF</Typography><Typography variant="h4" sx={{ fontSize: { xs: '1.6rem', md: '2.5rem' }, lineHeight: 1.17, fontWeight: 750, maxWidth: 430 }}>{CONFIGURACION_APLICACION.nombre}</Typography><Typography sx={{ mt: 2, opacity: 0.9, maxWidth: 400 }}>{CONFIGURACION_APLICACION.descripcion}</Typography></Box>
        <Box component="img" alt="Sistema Nacional DIF" src={RECURSOS.logos.sndif.blanco} sx={{ width: 250, maxWidth: '100%', objectFit: 'contain', objectPosition: 'left center' }} />
      </Stack>
      <Box sx={{ display: 'grid', placeItems: 'center', px: { xs: 2.5, md: 5 }, py: 5, bgcolor: 'background.default' }}>
        <Card sx={{ width: '100%', maxWidth: 450 }}>
          <CardContent sx={{ p: { xs: 3, sm: 5 }, '&:last-child': { pb: { xs: 3, sm: 5 } } }}>
            <Stack spacing={3} alignItems="center" textAlign="center">
              <Box component="img" alt="Llave MX" src={RECURSOS.logos.llaveMx.principal} sx={{ width: 190, height: 71, objectFit: 'contain' }} />
              <Box><Typography variant="h5" component="h1">Iniciar sesión</Typography><Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>Ingresa utilizando tu cuenta Llave MX para continuar con el proceso de validación.</Typography></Box>
              {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}
              <Button startIcon={<LoginOutlinedIcon />} fullWidth variant="contained" size="large" onClick={iniciarSesion}>Ingresar con Llave MX</Button>
              <Typography variant="caption" color="text.secondary">La autenticación se realiza a través del servicio oficial de Llave MX.</Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
