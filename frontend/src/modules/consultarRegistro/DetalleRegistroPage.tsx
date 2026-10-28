/* import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

import { TABLAS } from '../../config/tablas.config';
import { MODO_DESARROLLO } from '../auth/application/modoDesarrollo';
import {
  consultarDetalleVictima,
  type DetalleVictima,
} from './infrastructure/registroVictimas.historico.service';

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
  const { idRegistro } = useParams<{ idRegistro: string }>();
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
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/consulta-registros')} sx={{ mb: 2 }}>
        Volver al histórico
      </Button>

      <Typography sx={{ fontSize: 25, fontWeight: 800, mb: 1 }}>
        Detalle del registro de víctima
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {MODO_DESARROLLO
          ? 'Se muestran todos los campos del JSON seleccionado en la tabla. El archivo no se envía al servidor.'
          : 'Se muestran los 48 campos definidos por SSPC para esta aparición mensual.'}
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
              label={detalle.origen === 'API_SSPC' ? 'Origen: SSPC' : 'Origen: JSON local'}
              variant="outlined"
              color={detalle.origen === 'API_SSPC' ? 'success' : 'default'}
            />
          </Box>

          {SECCIONES.map(seccion => ({
            ...seccion,
            campos: MODO_DESARROLLO
              ? seccion.campos.filter(campo => Object.prototype.hasOwnProperty.call(detalle.campos, campo))
              : [...seccion.campos],
          })).filter(seccion => seccion.campos.length > 0).map(seccion => (
            <Paper
              key={seccion.titulo}
              variant="outlined"
              sx={{ mb: 3, overflow: 'hidden', borderRadius: 2 }}
            >
              <Box
                sx={{
                  backgroundColor: TABLAS.colores.encabezado,
                  color: '#fff',
                  px: 3,
                  py: 1.5,
                }}
              >
                <Typography fontWeight={800}>{seccion.titulo}</Typography>
              </Box>
              <Box
                sx={{
                  p: 3,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
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
                      sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                    >
                      {textoCampo(detalle.campos[campo])}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          ))}
          {MODO_DESARROLLO && Object.keys(detalle.campos).some(
            campo => !SECCIONES.some(seccion => (seccion.campos as readonly string[]).includes(campo))
          ) && (
            <Paper variant="outlined" sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ backgroundColor: TABLAS.colores.encabezado, color: '#fff', px: 3, py: 1.5 }}>
                <Typography fontWeight={800}>Otros campos del archivo</Typography>
              </Box>
              <Box sx={{ p: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
                {Object.entries(detalle.campos).filter(([campo]) =>
                  !SECCIONES.some(seccion => (seccion.campos as readonly string[]).includes(campo))
                ).map(([campo, valor]) => (
                  <Box key={campo}>
                    <Typography variant="caption" color="text.secondary">{tituloCampo(campo)}</Typography>
                    <Typography fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>{textoCampo(valor)}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}

export default DetalleRegistroPage;
 */