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
import { ArrowBack } from '@mui/icons-material';
import { ExpandMore } from '@mui/icons-material';
import { TABLAS } from '../../../config/tablas.config';
import { CONFIGURACION_APLICACION } from '../../../config/aplicacion.config';
import {
  consultarDetalleVictima,
  type DetalleVictima,
} from '../infrastructure/registroVictimas.historico.service';

const SECCIONES = [
  {
    titulo: '1. Identificación de la víctima',
    campos: [
      'IdentificadorVictima', 'Nombre', 'PrimerApellido', 'SegundoApellido',
      'CURP', 'TipoVictima', 'TipoPersonaMoral', 'Sexo', 'Genero',
      'PoblacionIndigena', 'Discapacidad', 'FechaNacimiento', 'Edad',
      'Nacionalidad', 'EntidadReportante', 'UsuarioReportante',
    ],
  },
  {
    titulo: '2. Corte, carpeta e información del delito',
    campos: [
      'AnioCorte', 'MesCorte', 'IdentificadorCarpeta', 'NumeroCarpeta',
      'FechaInicioCarpeta', 'HoraInicioCarpeta', 'ResumenHechos',
      'IdentificadorDelito', 'DelitoFiscalia', 'ModalidadFiscalia',
      'BienJuridico', 'DelitoCatalogo', 'SubtipoDelito', 'ModalidadCatalogo',
      'FormaAccion', 'InstrumentoComision',
    ],
  },
  {
    titulo: '3. Hechos y ubicación',
    campos: [
      'GradoConsumacion', 'FechaHechos', 'HoraHechos', 'BienJuridicoSabana',
      'DelitoSabana', 'SubtipoDelitoSabana', 'ModalidadDelitoSabana',
      'EntidadHechos', 'MunicipioHechos', 'LocalidadHechos', 'ColoniaHechos',
      'CodigoPostal', 'DomicilioHechos', 'CoordenadaX', 'CoordenadaY',
      'FechaRegistro',
    ],
  },
] as const;

const ETIQUETAS: Record<string, string> = {
  CURP: 'CURP',
  AnioCorte: 'Año de corte',
  MesCorte: 'Mes de corte',
  IdentificadorVictima: 'Identificador de víctima',
  IdentificadorCarpeta: 'Identificador de carpeta',
  IdentificadorDelito: 'Identificador del delito',
  NumeroCarpeta: 'Número de carpeta',
  FechaInicioCarpeta: 'Fecha de inicio de carpeta',
  HoraInicioCarpeta: 'Hora de inicio de carpeta',
  FechaNacimiento: 'Fecha de nacimiento',
  FechaHechos: 'Fecha de los hechos',
  HoraHechos: 'Hora de los hechos',
  FechaRegistro: 'Fecha de registro',
  CodigoPostal: 'Código postal',
  CoordenadaX: 'Coordenada X',
  CoordenadaY: 'Coordenada Y',
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
      <Button startIcon={<ArrowBack />}
        onClick={() => navigate(vieneDeRegistro
          ? CONFIGURACION_APLICACION.rutas.registroVictimas
          : CONFIGURACION_APLICACION.rutas.consultaRegistros)}
        sx={{ mb: 2 }}>
        {vieneDeRegistro ? 'Volver al registro de víctimas' : 'Volver al histórico'}
      </Button>

      <Typography sx={{ fontSize: 25, fontWeight: 800, mb: 1 }}>
        Detalle del registro de víctima
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Se muestran los campos almacenados para esta aparición de la víctima.
      </Typography>

      {cargando && (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

    {detalle && (
      <>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          <Chip label={`Periodo: ${detalle.mes}/${detalle.anio}`} />
          <Chip label={`ID interno: ${detalle.id_registro}`} />
          <Chip
            label={detalle.origen === 'API_SSPC' ? 'Origen: SESNSP' : 'Origen: JSON local'}
            variant="outlined"
            color={detalle.origen === 'API_SSPC' ? 'success' : 'default'}
          />
        </Box>

        {SECCIONES.map(seccion => (
          <Accordion
            key={seccion.titulo}
            defaultExpanded={false}
            variant="outlined"
            disableGutters
            sx={{
              mb: 2,
              borderRadius: '12px !important',
              overflow: 'hidden',
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                backgroundColor: TABLAS.colores.encabezado,
                px: 3,
                minHeight: 62,
                '& .MuiAccordionSummary-content': {
                  my: 1.5,
                },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1.25}
              >
                <Typography
                  fontWeight={800}
                  sx={{ color: '#fff' }}
                >
                  {seccion.titulo}
                </Typography>
              </Stack>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    lg: 'repeat(3, minmax(0, 1fr))',
                  },
                  gap: 2,
                }}
              >
                {seccion.campos.map(campo => (
                  <Box key={campo} sx={{ minWidth: 0, py: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {tituloCampo(campo)}
                    </Typography>

                    <Typography
                      fontWeight={600}
                      sx={{
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {textoCampo(detalle.campos[campo])}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}

        {Object.keys(detalle.campos).some(
          campo =>
            !SECCIONES.some(seccion =>
              (seccion.campos as readonly string[]).includes(campo)
            )
        ) && (
          <Accordion
            defaultExpanded={false}
            variant="outlined"
            disableGutters
            sx={{
              mb: 3,
              borderRadius: '12px !important',
              overflow: 'hidden',
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                backgroundColor: TABLAS.colores.encabezado,
                px: 3,
                minHeight: 62,
              }}
            >
              <Typography fontWeight={800} sx={{ color: '#fff' }}>
                Otros campos del archivo
              </Typography>
            </AccordionSummary>

            <AccordionDetails sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    lg: 'repeat(3, minmax(0, 1fr))',
                  },
                  gap: 2,
                }}
              >
                {Object.entries(detalle.campos)
                  .filter(
                    ([campo]) =>
                      !SECCIONES.some(seccion =>
                        (seccion.campos as readonly string[]).includes(campo)
                      )
                  )
                  .map(([campo, valor]) => (
                    <Box key={campo} sx={{ minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary">
                        {tituloCampo(campo)}
                      </Typography>

                      <Typography
                        fontWeight={600}
                        sx={{
                          overflowWrap: 'anywhere',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {textoCampo(valor)}
                      </Typography>
                    </Box>
                  ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        )}
      </>
    )}
    </Box>
  );
}

export default DetalleRegistroPage;
