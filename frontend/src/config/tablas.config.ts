
import { DISENO } from './diseno.config';

/**
 * Configuración visual centralizada de las tablas.
 */
export const TABLAS = {
  colores: {
    encabezado: DISENO.colores.guinda,
    encabezadoTexto: DISENO.colores.papel,
    filtros: DISENO.colores.guindaClaro,
    filtroFondo: DISENO.colores.papel,
    filaPar: DISENO.colores.papel,
    filaImpar: DISENO.colores.fondo,
    texto: DISENO.colores.texto,
    borde: DISENO.colores.borde,
    acciones: DISENO.colores.guinda,
  },

  dimensiones: {
    anchoMinimo: 1050,
    altoFiltro: 35,
    anchoMinimoFiltro: 0,
    anchoFiltroFecha: 120,
    radioBorde: 1.5,
    altoMaximo: 650,
  },

  tipografia: {
    encabezado: 12,
    filtros: 12,
    celdas: 12,
    paginacion: 12,
    grosorEncabezado: 800,
  },

  espaciado: {
    encabezadoVertical: 2,
    celdaVertical: 1.25,
    celdaHorizontal: 1,
  },

  responsive: {
    ancho: '100%',
    anchoMaximo: '100%',
    desbordamiento: 'auto',
    tablaLayout: 'fixed',
    anchoMovil: 1050,
  },

  encabezadoFijo: true,

  paginacion: {
    filasIniciales: 10,
    opciones: [5, 10, 25, 50],
    etiqueta: 'Registros por página:',
  },
} as const;

/**
 * Estilos reutilizables para componentes MUI.
 */
export const ESTILOS_TABLA = {
  contenedor: {
    width: TABLAS.responsive.ancho,
    maxWidth: TABLAS.responsive.anchoMaximo,
    minWidth: 0,
    border: 1,
    borderColor: TABLAS.colores.borde,
    borderRadius: TABLAS.dimensiones.radioBorde,
    overflowX: TABLAS.responsive.desbordamiento,
    overflowY: 'auto',
    maxHeight: TABLAS.dimensiones.altoMaximo,
  },

  tabla: {
    width: '100%',
    tableLayout: TABLAS.responsive.tablaLayout,
    minWidth: {
      xs: TABLAS.responsive.anchoMovil,
      md: 0,
    },
  },

  encabezado: {
    bgcolor: TABLAS.colores.encabezado,
  },

  encabezadoCelda: {
    color: TABLAS.colores.encabezadoTexto,
    fontWeight: TABLAS.tipografia.grosorEncabezado,
    fontSize: TABLAS.tipografia.encabezado,
    py: TABLAS.espaciado.encabezadoVertical,
    px: TABLAS.espaciado.celdaHorizontal,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    borderBottom: 0,
  },

  filaFiltros: {
    bgcolor: TABLAS.colores.filtros,
  },

  filtro: {
    width: '100%',
    minWidth: TABLAS.dimensiones.anchoMinimoFiltro,
    '& .MuiOutlinedInput-root': {
      bgcolor: TABLAS.colores.filtroFondo,
      borderRadius: 1,
      height: TABLAS.dimensiones.altoFiltro,
      fontSize: TABLAS.tipografia.filtros,
    },
    '& .MuiInputBase-input': {
      fontSize: TABLAS.tipografia.filtros,
      px: 0.75,
    },
  },

  filtroFecha: {
    width: '100%',
    minWidth: TABLAS.dimensiones.anchoFiltroFecha,
    '& .MuiOutlinedInput-root': {
      bgcolor: TABLAS.colores.filtroFondo,
      borderRadius: 1,
      height: TABLAS.dimensiones.altoFiltro,
      fontSize: TABLAS.tipografia.filtros,
    },
  },

  celda: {
    fontSize: TABLAS.tipografia.celdas,
    color: TABLAS.colores.texto,
    py: TABLAS.espaciado.celdaVertical,
    px: TABLAS.espaciado.celdaHorizontal,
    borderColor: TABLAS.colores.borde,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  celdaDestacada: {
    fontSize: TABLAS.tipografia.celdas,
    fontWeight: 600,
    color: TABLAS.colores.texto,
  },

  filaPar: {
    bgcolor: TABLAS.colores.filaPar,
  },

  filaImpar: {
    bgcolor: TABLAS.colores.filaImpar,
  },

  botonAccion: {
    color: TABLAS.colores.acciones,
  },

  botonLimpiar: {
    color: TABLAS.colores.encabezadoTexto,
  },

  paginacion: {
    borderTop: 1,
    borderColor: TABLAS.colores.borde,
    fontSize: TABLAS.tipografia.paginacion,
  },

  contador: {
    mt: 1,
    fontSize: TABLAS.tipografia.celdas,
    color: 'text.secondary',
    textAlign: 'right',
  },
} as const;
