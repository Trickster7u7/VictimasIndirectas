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
import { CheckCircleOutline, RestartAlt, VisibilityOutlined } from '@mui/icons-material';

import { CONFIGURACION_APLICACION } from '../../../config/aplicacion.config';
import { ESTILOS_TABLA, TABLAS } from '../../../config/tablas.config';
import {
  consultarCandidatasRenapo,
  type RegistroHistorico,
} from '../../consultarRegistro/infrastructure/registroVictimas.historico.service';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const ANIOS = Array.from(
  { length: Math.max(1, new Date().getFullYear() - 2025) },
  (_, indice) => new Date().getFullYear() - indice,
);

const FILTROS_INICIALES = {
  curp: '',
  nombre: '',
  edad: '',
  fechaHechos: '',
  entidad: '',
  carpeta: '',
};

type CampoFiltro = keyof typeof FILTROS_INICIALES;

// Estos campos aún no están incluidos en GET /historico. Se podrán poblar
// cuando FastAPI incorpore el estatus propio del expediente y los vínculos NNA.
type RegistroGestionVictimas = RegistroHistorico & {
  estatus?: string | null;
  numero_nna_relacionados?: number | null;
};

function mostrar(valor: string | null | undefined): string {
  return valor?.trim() || 'Sin dato';
}

function NnaRelacionados({ cantidad }: { cantidad?: number | null }) {
  if (cantidad === null || cantidad === undefined) {
    return (
      <Tooltip title="El backend todavía no proporciona los NNA vinculados a este registro">
        <span>—</span>
      </Tooltip>
    );
  }
  return <span>{cantidad}</span>;
}

export function RegistroVictimasPage() {
  const navegar = useNavigate();

  const [mes, setMes] = useState<number | ''>('');
  const [anio, setAnio] = useState<number | ''>('');
  const [filtros, setFiltros] = useState({ ...FILTROS_INICIALES });
  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);

  const [registros, setRegistros] = useState<RegistroGestionVictimas[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError('');

    const temporizador = window.setTimeout(async () => {
      try {
        const respuesta = await consultarCandidatasRenapo({
          pagina: pagina + 1,
          limite: filasPorPagina,
          curp: filtros.curp.trim() || undefined,
          nombre: filtros.nombre.trim() || undefined,
          edad: filtros.edad === '' ? undefined : Number(filtros.edad),
          fecha_hechos: filtros.fechaHechos.trim() || undefined,
          entidad: filtros.entidad.trim() || undefined,
          numero_carpeta: filtros.carpeta.trim() || undefined,
          // La selección por edad y CURP ahora se exige en el backend.
          mes: mes === '' ? undefined : mes,
          anio: anio === '' ? undefined : anio,
        });

        if (!vigente) return;
        setRegistros(respuesta.registros);
        setTotal(respuesta.total);
        if (pagina > 0 && pagina * filasPorPagina >= respuesta.total) {
          setPagina(0);
        }
      } catch (desconocido: unknown) {
        if (!vigente) return;
        setError(desconocido instanceof Error
          ? desconocido.message : 'No fue posible consultar el registro de víctimas.');
        setRegistros([]);
        setTotal(0);
      } finally {
        if (vigente) setCargando(false);
      }
    }, 300);

    return () => {
      vigente = false;
      window.clearTimeout(temporizador);
    };
  }, [anio, filtros, filasPorPagina, mes, pagina]);

  function cambiarFiltro(campo: CampoFiltro, valor: string) {
    setFiltros(actual => ({ ...actual, [campo]: valor }));
    setPagina(0);
  }

  function limpiarFiltros() {
    setFiltros({ ...FILTROS_INICIALES });
    setMes('');
    setAnio('');
    setPagina(0);
  }

  const hayFiltros = mes !== '' || anio !== '' ||
    Object.values(filtros).some(valor => valor.trim() !== '');

  const cabeceras = [
    'CURP', 'Nombre completo', 'Edad', 'Fecha del hecho', 'Estado', 'Carpeta',
    'NNA relacionados', 'Acciones',
  ];

  return (
    <Box>
      <Box sx={{ mb: 2.5 }}>
        <Typography color="text.secondary" sx={{ mt: 0.25, fontSize: 13.5 }}>
          Consulta y seguimiento de víctimas de feminicidio con posibles asocioasiones a NNA
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 2, mb: 2.5, border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField select size="small" label="Mes" value={mes}
            onChange={evento => {
              setMes(evento.target.value === '' ? '' : Number(evento.target.value));
              setPagina(0);
            }} sx={{ minWidth: 160 }}>
            <MenuItem value="">Todos los meses</MenuItem>
            {MESES.map((nombre, indice) => (
              <MenuItem key={nombre} value={indice + 1}>{nombre}</MenuItem>
            ))}
          </TextField>

          <TextField select size="small" label="Año" value={anio}
            onChange={evento => {
              setAnio(evento.target.value === '' ? '' : Number(evento.target.value));
              setPagina(0);
            }} sx={{ minWidth: 135 }}>
            <MenuItem value="">Todos los años</MenuItem>
            {ANIOS.map(valor => <MenuItem key={valor} value={valor}>{valor}</MenuItem>)}
          </TextField>


          <Chip size="small" icon={<CheckCircleOutline />} color="success"
            variant="outlined" label="Mayores de 10 años" />
          <Chip size="small" icon={<CheckCircleOutline />} color="success"
            variant="outlined" label="Con CURP" />

          <Button startIcon={<RestartAlt />} onClick={limpiarFiltros} disabled={!hayFiltros}>
            Limpiar filtros
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {total} registro{total === 1 ? '' : 's'}
          </Typography>
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} elevation={0} sx={ESTILOS_TABLA.contenedor}>
        <Table size="small" sx={{ minWidth: 1250 }}>
          <TableHead>
            <TableRow sx={ESTILOS_TABLA.encabezado}>
              {cabeceras.map(cabecera => (
                <TableCell key={cabecera} align={cabecera === 'Acciones' ? 'center' : 'left'}
                  sx={ESTILOS_TABLA.encabezadoCelda}>
                  {cabecera}
                </TableCell>
              ))}
            </TableRow>
            <TableRow sx={ESTILOS_TABLA.filaFiltros}>
              <TableCell><TextField size="small" fullWidth placeholder="Buscar CURP"
                value={filtros.curp} onChange={evento => cambiarFiltro('curp', evento.target.value)}
                sx={ESTILOS_TABLA.filtro} /></TableCell>
              <TableCell><TextField size="small" fullWidth placeholder="Buscar nombre"
                value={filtros.nombre} onChange={evento => cambiarFiltro('nombre', evento.target.value)}
                sx={ESTILOS_TABLA.filtro} /></TableCell>
              <TableCell><TextField size="small" fullWidth type="number" placeholder="Edad"
                value={filtros.edad}
                onChange={evento => {
                  const valor = evento.target.value;
                  if (valor === '' || /^\d{1,3}$/.test(valor)) cambiarFiltro('edad', valor);
                }}
                inputProps={{ min: 0, step: 1 }}
                sx={ESTILOS_TABLA.filtro} /></TableCell>
              <TableCell><TextField size="small" fullWidth placeholder="Buscar fecha"
                value={filtros.fechaHechos} onChange={evento => cambiarFiltro('fechaHechos', evento.target.value)}
                sx={ESTILOS_TABLA.filtroFecha} /></TableCell>
              <TableCell><TextField size="small" fullWidth placeholder="Buscar estado"
                value={filtros.entidad} onChange={evento => cambiarFiltro('entidad', evento.target.value)}
                sx={ESTILOS_TABLA.filtro} /></TableCell>
              <TableCell><TextField size="small" fullWidth placeholder="Buscar carpeta"
                value={filtros.carpeta} onChange={evento => cambiarFiltro('carpeta', evento.target.value)}
                sx={ESTILOS_TABLA.filtro} /></TableCell>
              <TableCell />
              <TableCell />
              <TableCell />
            </TableRow>
          </TableHead>

          <TableBody>
            {registros.map((registro, indice) => (
              <TableRow key={registro.id_registro} hover
                sx={indice % 2 === 0 ? ESTILOS_TABLA.filaPar : ESTILOS_TABLA.filaImpar}>
                <TableCell sx={ESTILOS_TABLA.celda}>{mostrar(registro.curp)}</TableCell>
                <TableCell sx={ESTILOS_TABLA.celdaDestacada}>{mostrar(registro.nombre_completo)}</TableCell>
                <TableCell sx={ESTILOS_TABLA.celda}>
                  {registro.edad === null ? 'Sin dato' : `${registro.edad} años`}
                </TableCell>
                <TableCell sx={ESTILOS_TABLA.celda}>{mostrar(registro.fecha_hechos)}</TableCell>
                <TableCell sx={ESTILOS_TABLA.celda}>{mostrar(registro.entidad_hechos)}</TableCell>
                <TableCell sx={ESTILOS_TABLA.celda}>{mostrar(registro.numero_carpeta)}</TableCell>
                <TableCell sx={ESTILOS_TABLA.celda}>
                  <NnaRelacionados cantidad={registro.numero_nna_relacionados} />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Ver detalle del registro">
                    <IconButton size="small" sx={ESTILOS_TABLA.botonAccion}
                      aria-label={`Ver detalle de ${registro.nombre_completo}`}
                      onClick={() => navegar(`${CONFIGURACION_APLICACION.rutas.registroVictimas}/${registro.id_registro}`)}>
                      <VisibilityOutlined fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

            {registros.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                  {cargando ? <CircularProgress size={25} /> : (
                    <Typography color="text.secondary">
                      {error ? 'No se pudieron cargar los registros.'
                        : hayFiltros ? 'No se encontraron registros con estos filtros.'
                          : 'Todavía no hay víctimas verificadas descargadas desde SESNSP.'}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TablePagination component="div" count={total} page={pagina}
          rowsPerPage={filasPorPagina}
          onPageChange={(_, paginaNueva) => setPagina(paginaNueva)}
          onRowsPerPageChange={evento => {
            setFilasPorPagina(Number(evento.target.value));
            setPagina(0);
          }}
          rowsPerPageOptions={[...TABLAS.paginacion.opciones]}
          labelRowsPerPage={TABLAS.paginacion.etiqueta}
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
          sx={ESTILOS_TABLA.paginacion} />
      </TableContainer>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        El estatus de gestión y el número de NNA relacionados se mostrarán cuando
        el backend incorpore esos datos. Un guion no significa que existan cero NNA.
      </Typography>
    </Box>
  );
}

export default RegistroVictimasPage;
