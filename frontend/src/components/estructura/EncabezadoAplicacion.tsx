import { useState } from 'react';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { Alert, AppBar, Avatar, Box, Button, IconButton, Snackbar, Stack, Toolbar, Tooltip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { RECURSOS } from '../../config/recursos';
import { DISENO } from '../../config/diseno.config';
import { CONFIGURACION_APLICACION } from '../../config/aplicacion.config';
import { usarAutenticacion } from '../../modules/auth/application/usarAutenticacion';
import { MODO_DESARROLLO } from '../../modules/auth/application/modoDesarrollo';

interface Props { alternarMenu: () => void; }

export function EncabezadoAplicacion({ alternarMenu }: Props) {
  const navigate = useNavigate();
  const { usuario, cerrarSesion } = usarAutenticacion();
  const [cerrando, establecerCerrando] = useState(false);
  const [error, establecerError] = useState<string | null>(null);
  const nombre = [usuario?.nombre, usuario?.primer_apellido, usuario?.segundo_apellido].filter(Boolean).join(' ') || 'Usuario';
  const salir = async () => {
    try {
      establecerCerrando(true);
      establecerError(null);
      await cerrarSesion();
      navigate(CONFIGURACION_APLICACION.rutas.inicioSesion, { replace: true });
    } catch (err) {
      establecerError(err instanceof Error ? err.message : 'No fue posible cerrar la sesión.');
    } finally {
      establecerCerrando(false);
    }
  };

  return (
    <>
      <AppBar position="fixed" elevation={0} sx={{ zIndex: (t) => t.zIndex.drawer + 1, bgcolor: DISENO.colores.guinda, color: '#fff' }}>
        <Toolbar sx={{ minHeight: `${DISENO.estructura.altoEncabezadoPrincipal}px !important`, px: { xs: 1.5, sm: 3 }, gap: 1 }}>
          <Tooltip title="Abrir o contraer navegación"><IconButton edge="start" color="inherit" onClick={alternarMenu} aria-label="Alternar menú"><MenuRoundedIcon /></IconButton></Tooltip>
          <Box component="img" src={RECURSOS.logos.sndif.blanco} alt="Secretaria de salud | Sistema Nacional Para El Desarrollo Integral De La Familia" sx={{ height: { xs: 28, sm: 40 }, maxWidth: { xs: 148, sm: 212 }, objectFit: 'contain', objectPosition: 'left center' }} />
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="caption" sx={{ display: { xs: 'none', md: 'block' }, opacity: 0.92 }}>{DISENO.marca.leyendaEncabezado}</Typography>
        </Toolbar>
        <Box sx={{ height: DISENO.estructura.altoEncabezadoSecundario, bgcolor: DISENO.colores.guindaOscuro, px: { xs: 2, sm: 3 }, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Stack direction="row" alignItems="center" spacing={1.2}>
            <Avatar sx={{ width: 23, height: 23, bgcolor: DISENO.colores.guindaClaro, border: '1px solid #FFFFFF66' }}><PersonOutlineOutlinedIcon sx={{ fontSize: 16 }} /></Avatar>
            <Typography variant="caption" noWrap sx={{ maxWidth: { xs: 160, sm: 320 } }}>{nombre}</Typography>
            {MODO_DESARROLLO ? (
              <Typography variant="caption" sx={{ ml: 1, opacity: 0.9 }}>Modo local de pruebas</Typography>
            ) : (
              <Button color="inherit" size="small" disabled={cerrando} onClick={() => void salir()} startIcon={<LogoutOutlinedIcon fontSize="small" />} sx={{ ml: 1 }} aria-label="Cerrar sesión">Salir</Button>
            )}
          </Stack>
        </Box>
      </AppBar>
      <Snackbar open={Boolean(error)} autoHideDuration={6500} onClose={() => establecerError(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="error" onClose={() => establecerError(null)}>{error}</Alert>
      </Snackbar>
    </>
  );
}
