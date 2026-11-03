import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
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
  OpenInNew,
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
 * Campos de identificación presentes en el JSON de SESNSP.
 * La información de carpeta, delito y hechos se consulta en el detalle histórico.
 */
const IDENTIFICACION = [
  ['Sexo', 'Sexo'],
  ['Genero', 'Género'],
  ['FechaNacimiento', 'Fecha de nacimiento'],
  ['Edad', 'Edad'],
  ['Nacionalidad', 'Nacionalidad'],
  ['EntidadReportante', 'Entidad reportante'],
] as const;

interface FilaNnaDemostrativa {
  id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  entidadNacimiento: string;
  fechaNacimiento: string;
  curp: string;
  sexo: string;
}

/** Datos ficticios: no representan personas ni parentescos reales. */
const NNA_DEMOSTRATIVOS: FilaNnaDemostrativa[] = [
  {
    id: 'DEMO-01',
    nombre: 'NNA de demostración 1',
    apellidoPaterno: 'apellidp',
    apellidoMaterno: 'apellidm',
    entidadNacimiento: 'Entidad de nacimiento',
    fechaNacimiento: 'Fecha de nacimiento',
    curp: 'CURP',
    sexo: 'Sexo',
  },
  {
    id: 'DEMO-02',
    nombre: 'NNA de demostración 1',
    apellidoPaterno: 'apellidp',
    apellidoMaterno: 'apellidm',
    entidadNacimiento: 'Entidad de nacimiento',
    fechaNacimiento: 'Fecha de nacimiento',
    curp: 'CURP',
    sexo: 'Sexo',
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
  const [identificacionAbierta, setIdentificacionAbierta] = useState(false);

  useEffect(() => {
    let vigente = true;
    setDetalle(null);
    setError('');
    setCargando(true);
    setMostrandoNnaDemostrativos(false);
    setIdentificacionAbierta(false);

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
    <Box sx={{ pb: 2 }}>
      <Button startIcon={<ArrowBack />}
        onClick={() => navegar(CONFIGURACION_APLICACION.rutas.registroVictimas)}
        sx={{ mb: 1 }}>
        Volver a registros de víctimas
      </Button>

      {cargando && <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {detalle && (
        <Stack spacing={1.5}>
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 2.5,
              borderLeft: 4,
              borderLeftColor: DISENO.colores.guinda,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                px: 1.5,
                py: 1.25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  IDENTIFICACIÓN DE LA VÍCTIMA
                </Typography>
                <Typography
                  sx={{ fontSize: 15, fontWeight: 800, overflowWrap: 'anywhere' }}
                >
                  {nombreCompletoVictima}
                </Typography>
                <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
                  <Chip size="small" label={`CURP: ${mostrarDato(curpVictima)}`} />
                </Stack>
              </Box>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<OpenInNew />}
                  onClick={() => navegar(
                    `${CONFIGURACION_APLICACION.rutas.consultaRegistros}/${detalle.id_registro}`
                  )}
                  sx={{
                    bgcolor: DISENO.colores.guinda,
                    textTransform: 'none',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    '&:hover': { bgcolor: DISENO.colores.guinda, filter: 'brightness(0.9)' },
                  }}
                >
                  Detalles de la Victima
                </Button>
                <IconButton
                  size="small"
                  aria-label={identificacionAbierta ? 'Contraer identificación' : 'Expandir identificación'}
                  aria-expanded={identificacionAbierta}
                  onClick={() => setIdentificacionAbierta(abierta => !abierta)}
                  sx={{ color: DISENO.colores.guinda }}
                >
                  <ExpandMore
                    sx={{
                      transform: identificacionAbierta ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 180ms ease',
                    }}
                  />
                </IconButton>
              </Stack>
            </Box>
            <Collapse in={identificacionAbierta}>
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderTop: 1,
                  borderColor: 'divider',
                  display: 'grid',
                  columnGap: 2,
                  rowGap: 1.5,
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    md: 'repeat(4, minmax(0, 1fr))',
                  },
                }}
              >
                {IDENTIFICACION.map(([clave, titulo]) => (
                  <Box key={clave} sx={{ minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {titulo}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
                      {mostrarDato(detalle.campos[clave])}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Collapse>
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 2.5, overflow: 'hidden' }}>
            <Box sx={{ p: 2 }}>
              <Typography fontWeight={800} sx={{ mb: 0.4 }}>
                Registros de las niñas, niños y adolescentes
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                La búsqueda utilizará automáticamente la CURP de la víctima directa.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }}
                spacing={1.5} sx={{ mb: 1.5 }}>
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

              <Alert severity="info" sx={{ mb: 1.5 }}>
                Demostración: todavía no existe la API de búsqueda de NNA. Al pulsar el botón
                se mostrarán filas ficticias, sin consultar personas reales ni guardar relaciones.
              </Alert>

              <Typography fontWeight={700} sx={{ mb: 1 }}>
                Datos de las niñas, niños y adolescentes
              </Typography>
              <TableContainer component={Paper} elevation={0}
                sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 720 }}>
                  <TableHead>
                    <TableRow sx={ESTILOS_TABLA.encabezado}>
                      {['CURP', 'Nombre', 'Apellido paterno', 'Apellido materno', 'Entidad de nacimiento', 'Fecha de nacimiento', 'Sexo'].map((titulo) => (
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
                        <TableCell>{nna.apellidoPaterno}</TableCell>
                        <TableCell>{nna.apellidoMaterno}</TableCell>
                        <TableCell>{nna.entidadNacimiento}</TableCell>
                        <TableCell>{nna.fechaNacimiento}</TableCell>
                        <TableCell>{nna.sexo}</TableCell>
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
