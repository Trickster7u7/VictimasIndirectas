import {
  Box, Divider, Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, Tooltip, Typography,
} from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import { CONFIGURACION_APLICACION } from '../../config/aplicacion.config';
import { ALTO_ENCABEZADO, DISENO } from '../../config/diseno.config';
import type { EstadoUsuario } from '../../modules/auth/domain/auth.types';
import { usarPermisos } from '../../modules/auth/application/PermisosContext';
import { ENTRADAS_MENU } from './navegacion.config';

interface Props {
  abierto: boolean;
  esMovil: boolean;
  estadoUsuario: EstadoUsuario;
  alCerrar: () => void;
}

export function BarraLateral({ abierto, esMovil, estadoUsuario, alCerrar }: Props) {
  const { pathname } = useLocation();
  const { permisos, cargandoPermisos, errorPermisos } = usarPermisos();
  const ancho = abierto ? DISENO.estructura.anchoMenu : DISENO.estructura.anchoMenuCompacto;

  const entradasVisibles = ENTRADAS_MENU.filter((entrada) => {
    if (!entrada.estados.includes(estadoUsuario)) return false;
    if (estadoUsuario !== 'ACTIVO') return true;
    // Todas las secciones para usuarios activos deben declarar un permiso.
    // Si la API falla, no se habilitan enlaces protegidos.
    return !cargandoPermisos && !errorPermisos &&
      Boolean(entrada.permiso && permisos.includes(entrada.permiso));
  });

  const contenido = (
    <Box sx={{
      height: '100%',
      bgcolor: DISENO.colores.guindaOscuro,
      backgroundImage: `linear-gradient(165deg, ${DISENO.colores.guindaOscuro}, ${DISENO.colores.guindaClaro})`,
      color: '#fff',
      overflowX: 'hidden',
    }}>
      <Box sx={{
        minHeight: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: 1.5,
      }}>
        {(esMovil || abierto) ? (
          <Box>
            <Typography sx={{ fontWeight: 750, fontSize: 15, lineHeight: 1.3 }}>
              {CONFIGURACION_APLICACION.nombreCorto}
            </Typography>
            <Typography variant="caption" sx={{ color: '#F0CEDC' }}>
              {DISENO.marca.leyendaMenu}
            </Typography>
          </Box>
        ) : <Typography fontWeight={800}>VI</Typography>}
      </Box>

      <Divider sx={{ borderColor: '#FFFFFF26' }} />
      <List disablePadding sx={{ pt: 1 }}>
        {entradasVisibles.map(({ ruta, texto, icono: Icono }) => {
          const activo = pathname === ruta;
          const textoVisible = ruta === CONFIGURACION_APLICACION.rutas.consultaRegistros &&
            !permisos.includes('registros.exportar')
            ? 'Consulta de registros'
            : texto;
          return (
            <Tooltip key={ruta} title={!abierto && !esMovil ? textoVisible : ''} placement="right">
              <ListItemButton
                component={NavLink}
                to={ruta}
                onClick={esMovil ? alCerrar : undefined}
                selected={activo}
                sx={{
                  minHeight: 48,
                  px: (abierto || esMovil) ? 2.2 : 2.4,
                  color: '#fff',
                  my: 0.25,
                  borderLeft: activo ? '4px solid #F0D1DF' : '4px solid transparent',
                  '&.Mui-selected': { bgcolor: DISENO.colores.activo, color: '#fff' },
                  '&.Mui-selected:hover': { bgcolor: '#A64E71' },
                  '&:hover': { bgcolor: '#FFFFFF1A' },
                }}
              >
                <ListItemIcon sx={{ minWidth: (abierto || esMovil) ? 39 : 25, color: 'inherit' }}>
                  <Icono fontSize="small" />
                </ListItemIcon>
                {(abierto || esMovil) && (
                  <ListItemText
                    primary={textoVisible}
                    primaryTypographyProps={{ fontSize: 13, fontWeight: activo ? 700 : 500 }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>
    </Box>
  );

  const papel = {
    top: ALTO_ENCABEZADO,
    height: `calc(100% - ${ALTO_ENCABEZADO}px)`,
    border: 0,
  };

  return esMovil ? (
    <Drawer
      variant="temporary"
      open={abierto}
      onClose={alCerrar}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { ...papel, width: DISENO.estructura.anchoMenu } }}
    >
      {contenido}
    </Drawer>
  ) : (
    <Drawer
      variant="permanent"
      sx={{
        width: ancho,
        flexShrink: 0,
        transition: 'width 180ms ease',
        '& .MuiDrawer-paper': {
          ...papel,
          width: ancho,
          transition: 'width 180ms ease',
        },
      }}
    >
      {contenido}
    </Drawer>
  );
}
