import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import { Visibility, RestartAlt, Refresh } from '@mui/icons-material';
import { TABLAS, ESTILOS_TABLA } from '../../../config/tablas.config';
import {
  consultarHistoricoVictimas,
  type RegistroHistorico,
} from '../infrastructure/registroVictimas.historico.service';
import { ControlSincronizacionVictimas } from './ControlSincronizacionVictimas';
import { usarPermisos } from '../../auth/application/PermisosContext';
import { useEntidades } from '../../catalogos/application/useEntidades';
import { MESES } from '../../catalogos/domain/meses';

const ANIOS = Array.from(
  { length: new Date().getFullYear() - 2025 },
  (_, indice) => new Date().getFullYear() - indice,
);

const FILTROS_INICIALES = {
  curp: '',
  nombre: '',
  fecha: '',
  edad: '',
  entidad: '',
  carpeta: '',
};

type CampoFiltro = keyof typeof FILTROS_INICIALES;

function mostrarValor(valor: string | number | null | undefined): string {
  return valor === null || valor === undefined || valor === ''
    ? 'Sin dato'
    : String(valor);
}

function etiquetaOrigen(registro: RegistroHistorico): string {
  return registro.verificado_api ? 'SESNSP' : 'JSON local';
}

export function ConsultaRegistrosPage() {

  const navigate = useNavigate();
  const { tienePermiso } = usarPermisos();

  const puedeSincronizar = tienePermiso('registros.sincronizar');
  const puedeVerDetalle = tienePermiso('registros.detalle.consultar');

  const {entidades, cargandoEntidades, errorEntidades} = useEntidades();

  const [mes, setMes] = useState<number | ''>('');
  const [anio, setAnio] = useState<number | ''>('');
  const [filtros, setFiltros] = useState({ ...FILTROS_INICIALES });
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState<number>(
    TABLAS.paginacion.filasIniciales,
  );

  const [registros, setRegistros] = useState<RegistroHistorico[]>([]);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let cancelada = false;

    setCargando(true);
    setError('');

    const temporizador = window.setTimeout(async () => {
      try {
        const edad = filtros.edad.trim();

        const respuesta = await consultarHistoricoVictimas({
          pagina: pagina + 1,
          limite: filasPorPagina,
          curp: filtros.curp.trim() || undefined,
          nombre: filtros.nombre.trim() || undefined,
          fecha_hechos: filtros.fecha.trim() || undefined,
          edad: /^\d+$/.test(edad) ? Number(edad) : undefined,
          entidad: filtros.entidad || undefined,
          numero_carpeta: filtros.carpeta.trim() || undefined,
          mes: mes === '' ? undefined : mes,
          anio: anio === '' ? undefined : anio,
        });

        if (cancelada) return;

        setRegistros(respuesta.registros);
        setTotalRegistros(respuesta.total);

        if (pagina > 0 && pagina * filasPorPagina >= respuesta.total) {
          setPagina(0);
        }
      } catch (desconocido) {
        if (cancelada) return;

        setError(
          desconocido instanceof Error
            ? desconocido.message
            : 'No fue posible obtener el histórico desde la base de datos.',
        );

        setRegistros([]);
        setTotalRegistros(0);
      } finally {
        if (!cancelada) setCargando(false);
      }
    }, 300);

    return () => {
      cancelada = true;
      window.clearTimeout(temporizador);
    };
  }, [pagina, filasPorPagina, filtros, mes, anio, recarga]);

  const cambiarFiltro = (campo: CampoFiltro, valor: string) => {
    setFiltros(anteriores => ({
      ...anteriores,
      [campo]: valor,
    }));

    setPagina(0);
  };

  const limpiarFiltros = () => {
    setFiltros({ ...FILTROS_INICIALES });
    setMes('');
    setAnio('');
    setPagina(0);
  };

  const encabezados = [
    'Mes',
    'Año',
    'CURP',
    'Nombre completo',
    'Fecha del hecho',
    'Edad',
    'Entidad',
    'Número de carpeta',
    'Origen',
    ...(puedeVerDetalle ? ['Acciones'] : []),
  ];

  const hayFiltrosActivos =
    mes !== '' ||
    anio !== '' ||
    Object.values(filtros).some(valor => valor.trim() !== '');

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      {puedeSincronizar && (
        <ControlSincronizacionVictimas
          alActualizarHistorico={() =>
            setRecarga(anterior => anterior + 1)
          }
        />
      )}

      {/* Filtros de periodo */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
          Histórico de registros de víctimas
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Registros almacenados, ordenados por periodo del más reciente al más antiguo.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <TextField
            select
            size="small"
            label="Mes"
            value={mes}
            onChange={evento => {
              const valor = evento.target.value;
              setMes(valor === '' ? '' : Number(valor));
              setPagina(0);
            }}
            sx={{ minWidth: 175 }}
          >
            <MenuItem value="">Todos los meses</MenuItem>
              {MESES.map((mes) => (
                <MenuItem key={mes.numero} value={mes.numero}>
                  {mes.nombre}
                </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Año"
            value={anio}
            onChange={evento => {
              const valor = evento.target.value;
              setAnio(valor === '' ? '' : Number(valor));
              setPagina(0);
            }}
            sx={{ minWidth: 145 }}
          >
            <MenuItem value="">Todos los años</MenuItem>
            {ANIOS.map(valor => (
              <MenuItem key={valor} value={valor}>
                {valor}
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            startIcon={
              cargando
                ? <CircularProgress size={16} color="inherit" />
                : <Refresh />
            }
            onClick={() => setRecarga(anterior => anterior + 1)}
            disabled={cargando}
            sx={{
              bgcolor: TABLAS.colores.encabezado,
              '&:hover': {
                bgcolor: TABLAS.colores.encabezado,
              },
            }}
          >
            Actualizar histórico
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Contador y limpieza */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography fontWeight={700}>
          Registros encontrados: {totalRegistros}
        </Typography>

        <Button
          size="small"
          startIcon={<RestartAlt />}
          onClick={limpiarFiltros}
        >
          Limpiar filtros
        </Button>
      </Box>

      {/* Tabla */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          ...ESTILOS_TABLA.contenedor,
          width: '100%',
          maxWidth: '100%',
          overflowX: 'auto',
        }}
      >
        <Table
          size="small"
          sx={{
            width: '100%',
            minWidth: 0,
            tableLayout: 'fixed',
          }}
        >
          <TableHead>
            <TableRow sx={ESTILOS_TABLA.encabezado}>
              {encabezados.map(titulo => (
                <TableCell
                  key={titulo}
                  align={titulo === 'Acciones' ? 'center' : 'left'}
                  sx={{
                    ...ESTILOS_TABLA.encabezadoCelda,
                    ...(titulo === 'Mes' && { width: 48, minWidth: 48, maxWidth: 48, px: 0.5 }),
                    ...(titulo === 'Año' && { width: 45, minWidth: 45, maxWidth: 45, px: 0.5 }),
                    ...(titulo === 'CURP' && { width: 170 }),
                    ...(titulo === 'Nombre completo' && { width: 155 }),
                    ...(titulo === 'Fecha del hecho' && { width: 105 }),
                    ...(titulo === 'Edad' && { width: 62 }),
                    ...(titulo === 'Entidad' && { width: 125 }),
                    ...(titulo === 'Número de carpeta' && { width: 140 }),
                    ...(titulo === 'Origen' && { width: 92 }),
                    ...(titulo === 'Acciones' && { width: 48, px: 0.5 }),
                  }}
                >
                  {titulo}
                </TableCell>
              ))}
            </TableRow>

            {/* Filtros por columna */}
            <TableRow sx={ESTILOS_TABLA.filaFiltros}>
              <TableCell />
              <TableCell />

              <TableCell>
                <TextField
                  placeholder="Buscar CURP"
                  size="small"
                  fullWidth
                  value={filtros.curp}
                  onChange={evento =>
                    cambiarFiltro('curp', evento.target.value)
                  }
                  sx={ESTILOS_TABLA.filtro}
                />
              </TableCell>

              <TableCell>
                <TextField
                  placeholder="Buscar nombre"
                  size="small"
                  fullWidth
                  value={filtros.nombre}
                  onChange={evento =>
                    cambiarFiltro('nombre', evento.target.value)
                  }
                  sx={ESTILOS_TABLA.filtro}
                />
              </TableCell>

              <TableCell>
                <TextField
                  placeholder="Fecha"
                  size="small"
                  fullWidth
                  value={filtros.fecha}
                  onChange={evento =>
                    cambiarFiltro('fecha', evento.target.value)
                  }
                  sx={ESTILOS_TABLA.filtro}
                />
              </TableCell>

              <TableCell>
                <TextField
                  type="number"
                  placeholder="Buscar edad"
                  size="small"
                  fullWidth
                  value={filtros.edad}
                  onChange={evento =>
                    cambiarFiltro('edad', evento.target.value)
                  }
                  sx={ESTILOS_TABLA.filtro}
                />
              </TableCell>

              <TableCell>
                <TextField
                  select
                  size="small"
                  fullWidth
                  value={filtros.entidad}
                  onChange={evento =>
                    cambiarFiltro('entidad', evento.target.value)
                  }
                  disabled={cargandoEntidades || Boolean(errorEntidades)}
                  sx={ESTILOS_TABLA.filtro}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="">Todas</MenuItem>

                  {entidades.map(entidad => (
                    <MenuItem
                      key={entidad.clave}
                      value={entidad.nombre}
                    >
                      {entidad.nombre}
                    </MenuItem>
                  ))}
                </TextField>
              </TableCell>

              <TableCell>
                <TextField
                  placeholder="Buscar carpeta"
                  size="small"
                  fullWidth
                  value={filtros.carpeta}
                  onChange={evento =>
                    cambiarFiltro('carpeta', evento.target.value)
                  }
                  sx={ESTILOS_TABLA.filtro}
                />
              </TableCell>

              <TableCell />

              {puedeVerDetalle && (
                <TableCell align="center">
                  <Tooltip title="Limpiar filtros">
                    <IconButton
                      size="small"
                      onClick={limpiarFiltros}
                      sx={ESTILOS_TABLA.botonLimpiar}
                    >
                      <RestartAlt />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {registros.map((registro, indice) => (
              <TableRow
                key={registro.id_registro}
                hover
                sx={
                  indice % 2 === 0
                    ? ESTILOS_TABLA.filaPar
                    : ESTILOS_TABLA.filaImpar
                }
              >
                <TableCell
                  sx={{
                    ...ESTILOS_TABLA.celda,
                    px: 0.5,
                    width: 48,
                    maxWidth: 48,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {MESES.find(mes => mes.numero === registro.mes)?.nombre ?? registro.mes}
                </TableCell>

                <TableCell
                  sx={{
                    ...ESTILOS_TABLA.celda,
                    px: 0.25,
                    width: 45,
                    maxWidth: 45,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {registro.anio}
                </TableCell>

                <TableCell
                  sx={{
                    ...ESTILOS_TABLA.celda,
                    whiteSpace: 'nowrap',
                    overflow: 'visible',
                    textOverflow: 'clip',
                    fontSize: '0.72rem',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {mostrarValor(registro.curp)}
                </TableCell>

                <TableCell sx={ESTILOS_TABLA.celdaDestacada}>
                  {mostrarValor(registro.nombre_completo)}
                </TableCell>

                <TableCell sx={ESTILOS_TABLA.celda}>
                  {mostrarValor(registro.fecha_hechos)}
                </TableCell>

                <TableCell sx={ESTILOS_TABLA.celda}>
                  {registro.edad !== null
                    ? `${registro.edad} años`
                    : 'Sin dato'}
                </TableCell>

                <TableCell sx={ESTILOS_TABLA.celda}>
                  {mostrarValor(registro.entidad_hechos)}
                </TableCell>

                {/* Número de carpeta: ancho limitado y texto seleccionable */}
                <TableCell
                  sx={{
                    ...ESTILOS_TABLA.celda,
                    width: 140,
                    maxWidth: 140,
                    overflow: 'hidden',
                  }}
                >
                  <Tooltip
                    title={mostrarValor(registro.numero_carpeta)}
                    placement="top"
                    arrow
                  >
                    <Typography
                      component="span"
                      sx={{
                        display: 'block',
                        width: '100%',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'text',
                        userSelect: 'text',
                        fontSize: 'inherit',
                        color: 'inherit',
                      }}
                    >
                      {mostrarValor(registro.numero_carpeta)}
                    </Typography>
                  </Tooltip>
                </TableCell>

                <TableCell sx={ESTILOS_TABLA.celda}>
                  <Tooltip
                    title={
                      registro.fecha_descarga
                        ? `Última importación: ${new Date(
                            registro.fecha_descarga,
                          ).toLocaleString('es-MX')}`
                        : 'Sin fecha de importación'
                    }
                  >
                    <Chip
                      size="small"
                      variant="outlined"
                      color={registro.verificado_api ? 'success' : 'default'}
                      label={etiquetaOrigen(registro)}
                    />
                  </Tooltip>
                </TableCell>

                {puedeVerDetalle && (
                  <TableCell align="center" sx={{ px: 0.5, width: 48 }}>
                    <Tooltip title="Ver los 48 campos del registro">
                      <IconButton
                        size="small"
                        sx={ESTILOS_TABLA.botonAccion}
                        onClick={() =>
                          navigate(`/consulta-registros/${registro.id_registro}`)
                        }
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                )}
              </TableRow>
            ))}

            {registros.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={puedeVerDetalle ? 10 : 9}
                  align="center"
                  sx={{ py: 5 }}
                >
                  {cargando ? (
                    <CircularProgress size={25} />
                  ) : (
                    <Typography color="text.secondary">
                      {error
                        ? 'No se pudieron cargar los registros.'
                        : hayFiltrosActivos
                          ? 'No existen registros con los filtros seleccionados.'
                          : 'No hay registros almacenados en PostgreSQL. Revisa la sincronización mensual con SESNSP.'}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
              )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={totalRegistros}
          page={pagina}
          rowsPerPage={filasPorPagina}
          onPageChange={(_, nuevaPagina) => setPagina(nuevaPagina)}
          onRowsPerPageChange={evento => {
            setFilasPorPagina(Number(evento.target.value));
            setPagina(0);
          }}
          rowsPerPageOptions={[...TABLAS.paginacion.opciones]}
          labelRowsPerPage={TABLAS.paginacion.etiqueta}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} de ${count}`
          }
          sx={ESTILOS_TABLA.paginacion}
        />
      </TableContainer>
    </Box>
  );
}

export default ConsultaRegistrosPage;
