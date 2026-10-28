import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Chip, CircularProgress, Collapse, Paper, Typography,
} from '@mui/material';
import {
  CheckCircleOutline, CloudDownloadOutlined, ExpandLess, ExpandMore,
  Refresh, Schedule, WarningAmberOutlined,
} from '@mui/icons-material';

import { TABLAS } from '../../../config/tablas.config';
import {
  consultarEstadoSincronizacion,
  sincronizarPeriodoVictimas,
  type EstadoSincronizacionVictimas,
  type PeriodoSincronizacion,
} from '../infrastructure/registroVictimas.historico.service';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function nombrePeriodo(periodo: PeriodoSincronizacion): string {
  return `${MESES[periodo.mes - 1]} ${periodo.anio}`;
}

function fechaHora(valor: string | null): string {
  if (!valor) return 'Sin descargas verificadas';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return 'Fecha no disponible';
  return fecha.toLocaleString('es-MX', {
    timeZone: 'America/Mexico_City',
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function ultimoPeriodoConsecutivo(periodos: PeriodoSincronizacion[]) {
  let ultimo: PeriodoSincronizacion | null = null;
  for (const periodo of periodos) {
    if (periodo.estado !== 'completado' || !periodo.verificado_api) break;
    ultimo = periodo;
  }
  return ultimo;
}

interface Props {
  alActualizarHistorico: () => void;
}

export function ControlSincronizacionVictimas({ alActualizarHistorico }: Props) {
  const [estado, setEstado] = useState<EstadoSincronizacionVictimas | null>(null);
  const [cargando, setCargando] = useState(true);
  const [periodoEnProceso, setPeriodoEnProceso] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [mostrarMeses, setMostrarMeses] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    consultarEstadoSincronizacion()
      .then(respuesta => {
        if (vigente) { setEstado(respuesta); setError(''); }
      })
      .catch((desconocido: unknown) => {
        if (vigente) setError(desconocido instanceof Error
          ? desconocido.message : 'No fue posible consultar las descargas.');
      })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [revision]);

  async function descargar(periodo: PeriodoSincronizacion) {
    if (!estado?.puede_sincronizar || periodoEnProceso) return;
    setPeriodoEnProceso(`${periodo.anio}-${periodo.mes}`);
    setError('');
    setAviso('');
    try {
      const resultado = await sincronizarPeriodoVictimas(periodo.anio, periodo.mes);
      setAviso(`${nombrePeriodo(periodo)}: ${resultado.mensaje}`);
      alActualizarHistorico();
    } catch (desconocido) {
      setError(desconocido instanceof Error ? desconocido.message : 'No se pudo descargar el mes.');
    } finally {
      setPeriodoEnProceso(null);
      setRevision(anterior => anterior + 1);
    }
  }

  const pendientes = estado?.periodos.filter(periodo => periodo.elegible &&
    (periodo.estado === 'pendiente' || periodo.estado === 'error')) ?? [];
  const siguiente = pendientes[0];
  const revisionPendiente = estado?.periodos.find(periodo => periodo.estado === 'requiere_revision');
  const actualizadoHasta = estado ? ultimoPeriodoConsecutivo(estado.periodos) : null;

  return (
    <Paper elevation={0} sx={{ px: { xs: 2, md: 3 }, py: 2, mb: 3,
      border: 1, borderColor: 'divider', borderLeft: 4,
      borderLeftColor: TABLAS.colores.encabezado, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography fontWeight={800} variant="subtitle1">
            {actualizadoHasta
              ? `Lista actualizada hasta ${nombrePeriodo(actualizadoHasta)}`
              : 'Lista pendiente de validación histórica'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {siguiente
              ? `${nombrePeriodo(siguiente)} pendiente de descarga${pendientes.length > 1
                ? ` · ${pendientes.length} meses por descargar` : ''}`
              : revisionPendiente
                ? `${nombrePeriodo(revisionPendiente)} pendiente de validar (JSON local)`
                : 'Todos los meses elegibles están descargados'}
          </Typography>
          {estado?.ultima_descarga && (
            <Typography variant="caption" color="text.secondary">
              Última descarga: {fechaHora(estado.ultima_descarga)}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button size="small" startIcon={<Refresh />} disabled={cargando || !!periodoEnProceso}
            onClick={() => setRevision(actual => actual + 1)}>
            Revisar
          </Button>
          <Button size="small" variant="contained"
            startIcon={periodoEnProceso ? <CircularProgress size={16} color="inherit" />
              : <CloudDownloadOutlined />}
            disabled={cargando || !estado?.puede_sincronizar || !siguiente || !!periodoEnProceso}
            onClick={() => { if (siguiente) void descargar(siguiente); }}
            sx={{ bgcolor: TABLAS.colores.encabezado,
              '&:hover': { bgcolor: TABLAS.colores.encabezado } }}>
            {periodoEnProceso ? 'Descargando…' : 'Descargar mes pendiente'}
          </Button>
          <Button size="small" variant="outlined"
            endIcon={mostrarMeses ? <ExpandLess /> : <ExpandMore />}
            onClick={() => setMostrarMeses(abierto => !abierto)}>
            {mostrarMeses ? 'Ocultar meses' : 'Ver checklist'}
          </Button>
        </Box>
      </Box>

      {!estado && cargando && <CircularProgress size={18} sx={{ mt: 1 }} />}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {aviso && <Alert severity="success" sx={{ mt: 2 }}>{aviso}</Alert>}
      {estado && !estado.puede_sincronizar && (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          La descarga manual requiere permisos administrativos.
        </Typography>
      )}

      <Collapse in={mostrarMeses && !!estado}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, pt: 2,
          borderTop: 1, borderColor: 'divider' }}>
          {estado?.periodos.map(periodo => {
            const completo = periodo.estado === 'completado';
            const requiereRevision = periodo.estado === 'requiere_revision';
            return (
              <Chip key={`${periodo.anio}-${periodo.mes}`} size="small" variant="outlined"
                icon={completo ? <CheckCircleOutline />
                  : requiereRevision ? <WarningAmberOutlined /> : <Schedule />}
                color={completo ? 'success' : requiereRevision ? 'warning'
                  : periodo.estado === 'error' ? 'error' : 'default'}
                label={`${MESES[periodo.mes - 1].slice(0, 3)} ${periodo.anio}`}
                title={`${nombrePeriodo(periodo)}: ${requiereRevision ? 'JSON local por revisar'
                  : completo ? `Descargado · ${fechaHora(periodo.fecha_descarga)}`
                    : periodo.estado === 'programado' ? 'Aún no corresponde' : periodo.estado}`}
              />
            );
          })}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Verde: verificado con SSPC · Amarillo: JSON local por revisar · Gris: pendiente o programado.
        </Typography>
      </Collapse>
    </Paper>
  );
}
