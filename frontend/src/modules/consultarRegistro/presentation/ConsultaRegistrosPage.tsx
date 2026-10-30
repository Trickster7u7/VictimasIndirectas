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

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const ANIOS = Array.from(
  { length: new Date().getFullYear() - 2025 },
  (_, indice) => new Date().getFullYear() - indice,
);

// Catálogo independiente de la página actual: los filtros deben aplicarse
// sobre TODO el histórico en PostgreSQL, no solo sobre diez registros visibles.
const ENTIDADES = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima',
  'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco',
  'México', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León',
  'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
  'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala',
  'Veracruz', 'Yucatán', 'Zacatecas',
];

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

  // Vacíos por defecto: el histórico debe mostrar TODOS los meses al abrirse.
  const [mes, setMes] = useState<number | ''>('');
  const [anio, setAnio] = useState<number | ''>('');
  const [filtros, setFiltros] = useState({ ...FILTROS_INICIALES });
  const [pagina, setPagina] = useState(0); // MUI comienza en cero.
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  const [registros, setRegistros] = useState<RegistroHistorico[]>([]);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [recarga, setRecarga] = useState(0);

  // El backend recibe pagina=1,2,3..., filtra todo PostgreSQL y ordena
  // primero año/mes más reciente. NO filtramos/paginamos de nuevo en React.
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

        // Al actualizar, un filtro puede reducir el número de páginas.
        if (pagina > 0 && pagina * filasPorPagina >= respuesta.total) {
          setPagina(0);
        }
      } catch (desconocido) {
        if (cancelada) return;
        setError(
          desconocido instanceof Error
            ? desconocido.message
            : 'No fue posible obtener el histórico desde de la base de datos.',
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
    setFiltros(anteriores => ({ ...anteriores, [campo]: valor }));
    setPagina(0);
  };

  const limpiarFiltros = () => {
    setFiltros({ ...FILTROS_INICIALES });
    setMes('');
    setAnio('');
    setPagina(0);
  };

  const encabezados = [
    'Mes', 'Año', 'CURP', 'Nombre completo', 'Fecha del hecho',
    'Edad', 'Entidad', 'Número de carpeta', 'Origen',
    ...(puedeVerDetalle ? ['Acciones'] : []),
  ];

  const hayFiltrosActivos = mes !== '' || anio !== '' ||
    Object.values(filtros).some(valor => valor.trim() !== '');

  return (
    <Box>
      {puedeSincronizar && (
        <ControlSincronizacionVictimas
          alActualizarHistorico={() => setRecarga(anterior => anterior + 1)}
        />
      )}
      {/* Filtros de periodo del histórico: NO realizan una descarga SESNSP. */}
      <Paper
        elevation={0}
        sx={{ p: 3, mb: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
          Histórico de registros de víctimas
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Registros almacenados, ordenados por periodo del más reciente al más antiguo.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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
            {MESES.map((nombre, indice) => (
              <MenuItem key={nombre} value={indice + 1}>{nombre}</MenuItem>
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
              <MenuItem key={valor} value={valor}>{valor}</MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            startIcon={cargando ? <CircularProgress size={16} color="inherit" /> : <Refresh />}
            onClick={() => setRecarga(anterior => anterior + 1)}
            disabled={cargando}
            sx={{
              bgcolor: TABLAS.colores.encabezado,
              '&:hover': { bgcolor: TABLAS.colores.encabezado },
            }}
          >
            Actualizar histórico
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography fontWeight={700}>
          Registros encontrados: {totalRegistros}
        </Typography>
        <Button size="small" startIcon={<RestartAlt />} onClick={limpiarFiltros}>
          Limpiar filtros
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={ESTILOS_TABLA.contenedor}>
        <Table size="small" sx={{ minWidth: 1420 }}>
          <TableHead>
            <TableRow sx={ESTILOS_TABLA.encabezado}>
              {encabezados.map(titulo => (
                <TableCell
                  key={titulo}
                  align={titulo === 'Acciones' ? 'center' : 'left'}
                  sx={ESTILOS_TABLA.encabezadoCelda}
                >
                  {titulo}
                </TableCell>
              ))}
            </TableRow>

            {/* Los filtros viajan a FastAPI para consultar todo el histórico. */}
            <TableRow sx={ESTILOS_TABLA.filaFiltros}>
              <TableCell />
              <TableCell />
              <TableCell>
                <TextField
                  placeholder="Buscar CURP" size="small" fullWidth
                  value={filtros.curp}
                  onChange={evento => cambiarFiltro('curp', evento.target.value)}
                  sx={ESTILOS_TABLA.filtro}
                />
              </TableCell>
              <TableCell>
                <TextField
                  placeholder="Buscar nombre" size="small" fullWidth
                  value={filtros.nombre}
                  onChange={evento => cambiarFiltro('nombre', evento.target.value)}
                  sx={ESTILOS_TABLA.filtro}
                />
              </TableCell>
              <TableCell>
                <TextField
                  placeholder="Fecha" size="small" fullWidth
                  value={filtros.fecha}
                  onChange={evento => cambiarFiltro('fecha', evento.target.value)}
                  sx={ESTILOS_TABLA.filtro}
                />
              </TableCell>
              <TableCell>
                <TextField
                  type="number" placeholder="Buscar edad" size="small" fullWidth
                  value={filtros.edad}
                  onChange={evento => cambiarFiltro('edad', evento.target.value)}
                  sx={ESTILOS_TABLA.filtro}
                />
              </TableCell>
              <TableCell>
                <TextField
                  select size="small" fullWidth
                  value={filtros.entidad}
                  onChange={evento => cambiarFiltro('entidad', evento.target.value)}
                  sx={ESTILOS_TABLA.filtro}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {ENTIDADES.map(entidad => (
                    <MenuItem key={entidad} value={entidad}>{entidad}</MenuItem>
                  ))}
                </TextField>
              </TableCell>
              <TableCell>
                <TextField
                  placeholder="Buscar carpeta" size="small" fullWidth
                  value={filtros.carpeta}
                  onChange={evento => cambiarFiltro('carpeta', evento.target.value)}
                  sx={ESTILOS_TABLA.filtro}
                />
              </TableCell>
              <TableCell />
              {puedeVerDetalle && (
                <TableCell align="center">
                  <Tooltip title="Limpiar filtros">
                    <IconButton
                      size="small" onClick={limpiarFiltros}
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
                sx={indice % 2 === 0 ? ESTILOS_TABLA.filaPar : ESTILOS_TABLA.filaImpar}
              >
                <TableCell sx={ESTILOS_TABLA.celda}>{MESES[registro.mes - 1] ?? registro.mes}</TableCell>
                <TableCell sx={ESTILOS_TABLA.celda}>{registro.anio}</TableCell>
                <TableCell sx={ESTILOS_TABLA.celda}>{mostrarValor(registro.curp)}</TableCell>
                <TableCell sx={ESTILOS_TABLA.celdaDestacada}>{mostrarValor(registro.nombre_completo)}</TableCell>
                <TableCell sx={ESTILOS_TABLA.celda}>{mostrarValor(registro.fecha_hechos)}</TableCell>
                <TableCell sx={ESTILOS_TABLA.celda}>
                  {registro.edad !== null ? `${registro.edad} años` : 'Sin dato'}
                </TableCell>
                <TableCell sx={ESTILOS_TABLA.celda}>{mostrarValor(registro.entidad_hechos)}</TableCell>
                <TableCell sx={ESTILOS_TABLA.celda}>{mostrarValor(registro.numero_carpeta)}</TableCell>
                <TableCell sx={ESTILOS_TABLA.celda}>
                  <Tooltip title={registro.fecha_descarga
                    ? `Última importación: ${new Date(registro.fecha_descarga).toLocaleString('es-MX')}`
                    : 'Sin fecha de importación'}>
                    <Chip
                      size="small"
                      variant="outlined"
                      color={registro.verificado_api ? 'success' : 'default'}
                      label={etiquetaOrigen(registro)}
                    />
                  </Tooltip>
                </TableCell>
                {puedeVerDetalle && (
                  <TableCell align="center">
                    <Tooltip title="Ver los 48 campos del registro">
                      <IconButton
                        size="small"
                        sx={ESTILOS_TABLA.botonAccion}
                        onClick={() => navigate(`/consulta-registros/${registro.id_registro}`)}
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
                <TableCell colSpan={puedeVerDetalle ? 10 : 9} align="center" sx={{ py: 5 }}>
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
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
          sx={ESTILOS_TABLA.paginacion}
        />
      </TableContainer>
    </Box>
  );
}

// Compatible también con un import por defecto en el enrutador actual.
export default ConsultaRegistrosPage;
