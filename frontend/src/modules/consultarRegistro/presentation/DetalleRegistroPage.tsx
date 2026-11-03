import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
} from '@mui/material';
import { ArrowBack, ExpandMore, OpenInNew } from '@mui/icons-material';
import { TABLAS } from '../../../config/tablas.config';
import { CONFIGURACION_APLICACION } from '../../../config/aplicacion.config';
import {
  consultarDetalleVictima,
  type DetalleVictima,
} from '../infrastructure/registroVictimas.historico.service';

const SECCIONES = [
  {
    titulo: '1. Datos generales',
    campos: [
      'Sexo',
      'Genero',
      'FechaNacimiento',
      'Edad',
      'Nacionalidad',
      'EntidadReportante',
    ],
  },
  {
    titulo: '2. Carpeta de investigación',
    campos: [
      'NumeroCarpeta',
      'FechaInicioCarpeta',
      'HoraInicioCarpeta',
    ],
  },
  {
    titulo: '3. Información del delito',
    campos: [
      'DelitoFiscalia',
      'ModalidadFiscalia',
      'BienJuridico',
      'DelitoCatalogo',
      'SubtipoDelito',
      'ModalidadCatalogo',
      'FormaAccion',
      'InstrumentoComision',
    ],
  },
  {
    titulo: '4. Hechos y ubicación',
    campos: [
      'GradoConsumacion',
      'FechaHechos',
      'HoraHechos',
      'BienJuridicoSabana',
      'EntidadHechos',
      'MunicipioHechos',
    ],
  },
] as const;

const ETIQUETAS: Record<string, string> = {
  CURP: 'CURP',
  NumeroCarpeta: 'Número de carpeta',
  FechaInicioCarpeta: 'Fecha de inicio de carpeta',
  HoraInicioCarpeta: 'Hora de inicio de carpeta',
  FechaNacimiento: 'Fecha de nacimiento',
  FechaHechos: 'Fecha de los hechos',
  HoraHechos: 'Hora de los hechos',
  BienJuridicoSabana: 'Bien jurídico de los hechos',
  EntidadHechos: 'Entidad de los hechos',
  MunicipioHechos: 'Municipio de los hechos',
};

function tituloCampo(campo: string): string {
  return ETIQUETAS[campo] ?? campo.replace(/([a-z])([A-Z])/g, '$1 $2');
}

function textoCampo(valor: string | number | null | undefined): string {
  if (valor === null || valor === undefined || String(valor).trim() === '') {
    return 'Sin dato';
  }
  return String(valor);
}

export function DetalleRegistroPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { idRegistro } = useParams<{ idRegistro: string }>();
  const vieneDeRegistro = location.pathname.startsWith(
    `${CONFIGURACION_APLICACION.rutas.registroVictimas}/`,
  );
  const [detalle, setDetalle] = useState<DetalleVictima | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelada = false;
    setCargando(true);
    setError('');
    setDetalle(null);

    const id = Number(idRegistro);
    if (!Number.isSafeInteger(id) || id <= 0) {
      setError('El identificador de registro no es válido.');
      setCargando(false);
      return;
    }

    consultarDetalleVictima(id)
      .then(resultado => {
        if (!cancelada) setDetalle(resultado);
      })
      .catch((desconocido: unknown) => {
        if (!cancelada) {
          setError(desconocido instanceof Error ? desconocido.message : 'Error al consultar el detalle.');
        }
      })
      .finally(() => {
        if (!cancelada) setCargando(false);
      });

    return () => { cancelada = true; };
  }, [idRegistro]);

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(
          vieneDeRegistro
            ? CONFIGURACION_APLICACION.rutas.registroVictimas
            : CONFIGURACION_APLICACION.rutas.consultaRegistros
        )}
        sx={{ mb: 1 }}
      >
        {vieneDeRegistro ? 'Volver al registro de víctimas' : 'Volver al histórico'}
      </Button>

      {cargando && (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {detalle && (
        <>
          <Box
            sx={{
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              borderLeft: 4,
              borderLeftColor: TABLAS.colores.encabezado,
              borderRadius: 2,
              p: 2,
              mb: 2,
              display: 'flex',
              alignItems: { xs: 'stretch', sm: 'center' },
              justifyContent: 'space-between',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                IDENTIFICACIÓN DE LA VÍCTIMA
              </Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 800, overflowWrap: 'anywhere' }}>
                {[
                  detalle.campos.Nombre,
                  detalle.campos.PrimerApellido,
                  detalle.campos.SegundoApellido,
                ].filter(Boolean).join(' ') || 'Sin nombre registrado'}
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                <Chip size="small" label={`CURP: ${textoCampo(detalle.campos.CURP)}`} />
                <Chip size="small" label={`Registro: ${detalle.id_registro}`} />
                <Chip size="small" label={`Periodo: ${detalle.mes}/${detalle.anio}`} />
                <Chip
                  size="small"
                  variant="outlined"
                  color={detalle.origen === 'API_SSPC' ? 'success' : 'default'}
                  label={detalle.origen === 'API_SSPC' ? 'SESNSP' : 'JSON local'}
                />
              </Stack>
            </Box>

            <Button
              variant="contained"
              startIcon={<OpenInNew />}
              onClick={() =>
                navigate(
                  `${CONFIGURACION_APLICACION.rutas.registroVictimas}/${detalle.id_registro}`
                )
              }
              sx={{
                bgcolor: TABLAS.colores.encabezado,
                textTransform: 'none',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                '&:hover': {
                  bgcolor: TABLAS.colores.encabezado,
                  filter: 'brightness(0.9)',
                },
              }}
            >
              NNAS relacionados a la víctima
            </Button>
          </Box>

          {SECCIONES.map((seccion) => (
            <Accordion
              key={seccion.titulo}
              //defaultExpanded={indice === 0}
              variant="outlined"
              disableGutters
              sx={{
                mb: 1.5,
                borderRadius: '10px !important',
                overflow: 'hidden',
                '&:before': { display: 'grid' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore sx={{ color: '#fff' }} />}
                sx={{
                  bgcolor: TABLAS.colores.encabezado,
                  px: 2,
                  minHeight: 48,
                  '&.Mui-expanded': { minHeight: 48 },
                  '& .MuiAccordionSummary-content': { my: 1 },
                  '& .MuiAccordionSummary-content.Mui-expanded': { my: 1 },
                }}
              >
                <Typography fontSize={14} fontWeight={800} color="#fff">
                  {seccion.titulo}
                </Typography>
              </AccordionSummary>

              <AccordionDetails sx={{ px: 2, py: 1.75 }}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, minmax(0, 1fr))',
                      lg: 'repeat(4, minmax(0, 1fr))',
                    },
                    columnGap: 2,
                    rowGap: 1.75,
                  }}
                >
                  {seccion.campos.map(campo => {
                    const valor = detalle.campos[campo];
                    const sinDato = valor === null || valor === undefined || String(valor).trim() === '';
                    return (
                      <Box key={campo} sx={{ minWidth: 0 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mb: 0.25 }}
                        >
                          {tituloCampo(campo)}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{
                            whiteSpace: 'pre-wrap',
                            overflowWrap: 'anywhere',
                            color: sinDato ? 'text.disabled' : 'text.primary',
                          }}
                        >
                          {textoCampo(valor)}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </>
      )}
    </Box>
  );
}

export default DetalleRegistroPage;
