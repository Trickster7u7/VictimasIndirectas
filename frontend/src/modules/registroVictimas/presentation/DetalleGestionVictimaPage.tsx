import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  ArrowBack,
  ExpandMore,
  PersonOutline,
  SearchOutlined,
} from '@mui/icons-material';

import { CONFIGURACION_APLICACION } from '../../../config/aplicacion.config';
import { ESTILOS_TABLA } from '../../../config/tablas.config';
import {
  consultarDetalleVictima,
  type DetalleVictima,
} from '../../consultarRegistro/infrastructure/registroVictimas.historico.service';
import { DISENO } from '../../../config/diseno.config';

/**
 * Campos de la primera sección del archivo de víctimas.
 * No muestra información de hechos, carpeta, delito ni otras secciones del histórico.
 */
const IDENTIFICACION = [
  ['CURP', 'CURP'],
  ['TipoVictima', 'Tipo de víctima'],
  ['TipoPersonaMoral', 'Tipo de persona moral'],
  ['Sexo', 'Sexo'],
  ['Genero', 'Género'],
  ['PoblacionIndigena', 'Población indígena'],
  ['Discapacidad', 'Discapacidad'],
  ['FechaNacimiento', 'Fecha de nacimiento'],
  ['Edad', 'Edad'],
  ['Nacionalidad', 'Nacionalidad'],
  ['EntidadReportante', 'Entidad reportante'],
  ['UsuarioReportante', 'Usuario reportante'],
] as const;

interface FilaNnaDemostrativa {
  id: string;
  nombre: string;
  curp: string;
  genero: string;
  entidad: string;
  estatus: string;
}

/** Datos ficticios: no representan personas ni parentescos reales. */
const NNA_DEMOSTRATIVOS: FilaNnaDemostrativa[] = [
  {
    id: 'DEMO-01',
    nombre: 'NNA de demostración 1',
    curp: 'No disponible',
    genero: 'Sin dato',
    entidad: 'Sin dato',
    estatus: 'Simulado',
  },
  {
    id: 'DEMO-02',
    nombre: 'NNA de demostración 2',
    curp: 'No disponible',
    genero: 'Sin dato',
    entidad: 'Sin dato',
    estatus: 'Simulado',
  },
];

function mostrarDato(valor: string | number | null | undefined): string {
  return valor === null || valor === undefined || String(valor).trim() === ''
    ? 'Sin dato'
    : String(valor);
}

function extraerCurp(detalle: DetalleVictima | null): string {
  return detalle?.campos.CURP == null
    ? ''
    : String(detalle.campos.CURP).trim().toUpperCase();
}

function obtenerNombreCompleto(detalle: DetalleVictima | null): string {
  if (!detalle) return 'Sin nombre registrado';
  const nombre = ['Nombre', 'PrimerApellido', 'SegundoApellido']
    .map((campo) => detalle.campos[campo])
    .filter((valor): valor is string | number =>
      valor !== null && valor !== undefined && String(valor).trim() !== '')
    .map((valor) => String(valor).trim())
    .join(' ');
  return nombre || 'Sin nombre registrado';
}

export function DetalleGestionVictimaPage() {
  const navegar = useNavigate();
  const { idRegistro } = useParams<{ idRegistro: string }>();
  const [detalle, setDetalle] = useState<DetalleVictima | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mostrandoNnaDemostrativos, setMostrandoNnaDemostrativos] = useState(false);

  useEffect(() => {
    let vigente = true;
    setDetalle(null);
    setError('');
    setCargando(true);
    setMostrandoNnaDemostrativos(false);

    const id = Number(idRegistro);
    if (!Number.isSafeInteger(id) || id <= 0) {
      setError('El identificador de registro no es válido.');
      setCargando(false);
      return;
    }

    consultarDetalleVictima(id)
      .then((respuesta) => { if (vigente) setDetalle(respuesta); })
      .catch((motivo: unknown) => {
        if (vigente) setError(motivo instanceof Error
          ? motivo.message
          : 'No fue posible consultar la identificación de la víctima.');
      })
      .finally(() => { if (vigente) setCargando(false); });

    return () => { vigente = false; };
  }, [idRegistro]);

  const curpVictima = extraerCurp(detalle);
  const nombreCompletoVictima = obtenerNombreCompleto(detalle);
  const curpDisponible = curpVictima.length === 18;

  function buscarNnaDeDemostracion() {
    // Sustituir por una petición al backend cuando se implemente la API NNA.
    // La CURP de la víctima se usará como criterio de búsqueda.
    // NO se infiere parentesco a partir de la CURP ni se guarda una vinculación.
    if (!curpDisponible) return;
    setMostrandoNnaDemostrativos(true);
  }

  return (
    <Box sx={{ pb: 4 }}>
      <Button startIcon={<ArrowBack />}
        onClick={() => navegar(CONFIGURACION_APLICACION.rutas.registroVictimas)}
        sx={{ mb: 2 }}>
        Volver a registros de víctimas
      </Button>

      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
        Detalles de la víctima
      </Typography>
      <Typography color="text.secondary" variant="body2" sx={{ mb: 2.5 }}>
        Identificación de la víctima y búsqueda demostrativa de NNA relacionados.
      </Typography>

      {cargando && <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {detalle && (
        <Stack spacing={2.5}>
          <Accordion defaultExpanded variant="outlined" disableGutters
            sx={{ borderRadius: '12px !important', overflow: 'hidden',
              '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMore />}
              sx={{ bgcolor: DISENO.colores.guinda, px: 2.5, minHeight: 62 }}>
              <Stack direction="row" alignItems="center" spacing={1.25}>
                <PersonOutline color="secondary" />
                <Box>
                  <Typography fontWeight={800} sx={{ color: DISENO.colores.papel }}>
                    Identificación de la víctima
                  </Typography>
                  <Typography variant="caption" sx={{ color: DISENO.colores.borde }}>
                    {nombreCompletoVictima}
                  </Typography>
                </Box>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2.5, py: 3 }}>
              <Box sx={{ display: 'grid', gap: 2.5,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(3, minmax(0, 1fr))' } }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary">Nombre completo</Typography>
                  <Typography fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
                    {nombreCompletoVictima}
                  </Typography>
                </Box>
                {IDENTIFICACION.map(([clave, titulo]) => (
                  <Box key={clave} sx={{ minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary">{titulo}</Typography>
                    <Typography fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
                      {mostrarDato(detalle.campos[clave])}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>

          <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: 'hidden' }}>
            <Box sx={{ p: 2.5 }}>
              <Typography fontWeight={800} sx={{ mb: 0.4 }}>
                Registros de las niñas, niños y adolescentes
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                La búsqueda utilizará automáticamente la CURP de la víctima directa.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }}
                spacing={1.5} sx={{ mb: 2 }}>
                <Chip variant="outlined" label={`CURP de la víctima: ${mostrarDato(curpVictima)}`}
                  sx={{ maxWidth: '100%' }} />
                <Button variant="contained" startIcon={<SearchOutlined />}
                  disabled={!curpDisponible}
                  onClick={buscarNnaDeDemostracion}>
                  Buscar NNA relacionados
                </Button>
              </Stack>

              {!curpDisponible && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Este registro no contiene una CURP de 18 caracteres; no puede iniciarse la búsqueda.
                </Alert>
              )}

              <Alert severity="info" sx={{ mb: 2 }}>
                Demostración: todavía no existe la API de búsqueda de NNA. Al pulsar el botón
                se mostrarán filas ficticias, sin consultar personas reales ni guardar relaciones.
              </Alert>

              <Typography fontWeight={700} sx={{ mb: 1.5 }}>
                Datos de las niñas, niños y adolescentes
              </Typography>
              <TableContainer component={Paper} elevation={0}
                sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 720 }}>
                  <TableHead>
                    <TableRow sx={ESTILOS_TABLA.encabezado}>
                      {['CURP', 'Nombre completo', 'Género', 'Estado', 'Estatus'].map((titulo) => (
                        <TableCell key={titulo} sx={ESTILOS_TABLA.encabezadoCelda}>
                          {titulo}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mostrandoNnaDemostrativos ? NNA_DEMOSTRATIVOS.map((nna) => (
                      <TableRow key={nna.id} hover>
                        <TableCell>{nna.curp}</TableCell>
                        <TableCell>{nna.nombre}</TableCell>
                        <TableCell>{nna.genero}</TableCell>
                        <TableCell>{nna.entidad}</TableCell>
                        <TableCell><Chip size="small" label={nna.estatus} variant="outlined" /></TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary" variant="body2">
                            Presiona «Buscar NNA relacionados» para visualizar la tabla de ejemplo.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {mostrandoNnaDemostrativos && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                  2 registros ficticios. La CURP de la víctima no permite identificar
                  automáticamente parentescos: una API futura tendrá que verificar los vínculos.
                </Typography>
              )}
            </Box>
          </Paper>
        </Stack>
      )}
    </Box>
  );
}

export default DetalleGestionVictimaPage;
