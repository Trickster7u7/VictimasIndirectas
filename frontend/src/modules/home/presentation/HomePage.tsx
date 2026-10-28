import { useEffect, useState, type ReactNode } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChildCareOutlinedIcon from '@mui/icons-material/ChildCareOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';

import { usarAutenticacion } from '../../auth/application/usarAutenticacion';
import {
  consultarEstadisticasVictimas,
  type EstadisticasVictimas,
} from '../infrastructure/estadisticasVictimas.service';

const CLAVE_ALERTA = 'validacion_activa_vista';

interface TarjetaMetricaProps {
  titulo: string;
  valor: number | null;
  descripcion: string;
  icono: ReactNode;
  cargando: boolean;
}

function TarjetaMetrica({ titulo, valor, descripcion, icono, cargando }: TarjetaMetricaProps) {
  return (
    <Card sx={{ height: '100%', borderTop: 4, borderTopColor: 'primary.main' }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 650 }}>
              {titulo}
            </Typography>
            {cargando ? (
              <Skeleton variant="text" width={100} height={52} sx={{ my: 0.5 }} />
            ) : (
              <Typography variant="h4" sx={{ mt: 1, mb: 0.5, fontSize: 34, color: 'primary.main' }}>
                {valor === null ? '—' : valor.toLocaleString('es-MX')}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', p: 1.25, borderRadius: 2, color: 'primary.main', bgcolor: 'action.hover' }}>
            {icono}
          </Box>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {descripcion}
        </Typography>
      </CardContent>
    </Card>
  );
}

function formatearFecha(fecha: string): string {
  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) return 'Sin fecha disponible';
  return valor.toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function HomePage() {
  const { usuario } = usarAutenticacion();
  const idUsuario = usuario?.id;
  const [mostrar, establecerMostrar] = useState(
    () => sessionStorage.getItem(CLAVE_ALERTA) !== '1',
  );
  const [estadisticas, establecerEstadisticas] = useState<EstadisticasVictimas | null>(null);
  const [cargando, establecerCargando] = useState(true);
  const [error, establecerError] = useState<string | null>(null);
  const [solicitud, establecerSolicitud] = useState(0);

  useEffect(() => {
    if (idUsuario == null) return;

    const controlador = new AbortController();
    establecerCargando(true);
    establecerError(null);

    consultarEstadisticasVictimas(controlador.signal)
      .then((datos) => {
        if (!controlador.signal.aborted) establecerEstadisticas(datos);
      })
      .catch((motivo: unknown) => {
        if (!controlador.signal.aborted) {
          establecerError(
            motivo instanceof Error ? motivo.message : 'No se pudieron consultar las estadísticas.',
          );
        }
      })
      .finally(() => {
        if (!controlador.signal.aborted) establecerCargando(false);
      });

    return () => controlador.abort();
  }, [idUsuario, solicitud]);

  if (!usuario) return null;

  const cerrar = () => {
    sessionStorage.setItem(CLAVE_ALERTA, '1');
    establecerMostrar(false);
  };

  return (
    <Stack spacing={3}>
      {mostrar && (
        <Alert severity="success" onClose={cerrar} variant="outlined" role="status">
          <strong>Cuenta validada.</strong> Tu cuenta se encuentra activa y ya puedes utilizar los módulos habilitados.
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}>
        <Box>
          <Typography variant="h6">Metricas generales</Typography>
          <Typography variant="body2" color="text.secondary">
            metricas generadas a partir de la informacion de SESNSP
          </Typography>
        </Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<RefreshOutlinedIcon />}
          onClick={() => establecerSolicitud((actual) => actual + 1)}
          disabled={cargando}
        >
          Actualizar indicadores
        </Button>
      </Stack>

      {error && <Alert severity="error" role="alert">{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
        <TarjetaMetrica
          titulo="Total de víctimas"
          valor={estadisticas?.total_victimas ?? null}
          descripcion="Registros de víctimas descargados y verificados"
          icono={<PeopleAltOutlinedIcon fontSize="large" />}
          cargando={cargando}
        />
        <TarjetaMetrica
          titulo="Víctimas menores de 18 años"
          valor={estadisticas?.victimas_menores_18 ?? null}
          descripcion="Edad registrada entre 0 y 17 años"
          icono={<ChildCareOutlinedIcon fontSize="large" />}
          cargando={cargando}
        />
        <TarjetaMetrica
          titulo="Registros con CURP inválida"
          valor={estadisticas?.registros_curp_invalida ?? null}
          descripcion="Sin CURP o con formato estructural incorrecto"
          icono={<BadgeOutlinedIcon fontSize="large" />}
          cargando={cargando}
        />
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }}>
        <Chip icon={<CheckCircleOutlineIcon />} color="success" size="small" variant="outlined" label="Fuente: SESNSP verificada" />
        {estadisticas && (
          <Typography variant="caption" color="text.secondary">
            Consulta realizada: {formatearFecha(estadisticas.fecha_consulta)} (CDMX)
          </Typography>
        )}
      </Stack>

      <Typography variant="caption" color="text.secondary">
        Los indicadores cuentan registros históricos almacenados, no personas únicas. Si una víctima aparece en más de un periodo se contabilizará en cada uno. No se incluyen cargas JSON de prueba.
      </Typography>
    </Stack>
  );
}
