import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
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
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';

import {
  consultarResumenPeriodos,
  type ResumenPeriodo,
} from '../infrastructure/resumenPeriodos.service';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function ResumenPeriodosPage() {
  const [filas, establecerFilas] = useState<ResumenPeriodo[]>([]);
  const [cargando, establecerCargando] = useState(true);
  const [error, establecerError] = useState<string | null>(null);
  const [solicitud, establecerSolicitud] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();
    establecerCargando(true);
    establecerError(null);

    consultarResumenPeriodos(controlador.signal)
      .then((datos) => {
        if (!controlador.signal.aborted) establecerFilas(datos);
      })
      .catch((motivo: unknown) => {
        if (!controlador.signal.aborted) {
          establecerFilas([]);
          establecerError(motivo instanceof Error ? motivo.message : 'No se pudo consultar el resumen.');
        }
      })
      .finally(() => {
        if (!controlador.signal.aborted) establecerCargando(false);
      });

    return () => controlador.abort();
  }, [solicitud]);

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Resumen de registros</Typography>
          <Typography variant="body2" color="text.secondary">
            Consulta agregada por periodo. No contiene nombres, CURP ni información de víctimas individuales.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshOutlinedIcon />}
          disabled={cargando}
          onClick={() => establecerSolicitud((valor) => valor + 1)}
        >
          Actualizar
        </Button>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table size="small" aria-label="Resumen de registros de víctimas por periodo">
          <TableHead>
            <TableRow>
              <TableCell>Año</TableCell>
              <TableCell>Mes</TableCell>
              <TableCell align="right">Cantidad de registros</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cargando ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={24} aria-label="Cargando resumen" />
                </TableCell>
              </TableRow>
            ) : filas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                  No hay periodos disponibles.
                </TableCell>
              </TableRow>
            ) : filas.map((fila) => (
              <TableRow key={`${fila.anio}-${fila.mes}`} hover>
                <TableCell>{fila.anio}</TableCell>
                <TableCell>{MESES[fila.mes - 1]}</TableCell>
                <TableCell align="right">{fila.total_registros.toLocaleString('es-MX')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="caption" color="text.secondary">
        Los conteos corresponden a periodos descargados y verificados. La pantalla es de solo lectura.
      </Typography>
    </Stack>
  );
}
