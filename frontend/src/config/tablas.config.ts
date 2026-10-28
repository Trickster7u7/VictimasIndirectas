
import { DISENO } from './diseno.config';

/**
 * Configuración visual centralizada de las tablas.
 * Reutiliza la identidad institucional del sistema.
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
    anchoMinimo: 1250,
    altoFiltro: 35,
    anchoMinimoFiltro: 110,
    anchoFiltroFecha: 155,
    radioBorde: 1.5,
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
    celdaHorizontal: 2,
  },

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
    border: 1,
    borderColor: TABLAS.colores.borde,
    borderRadius: TABLAS.dimensiones.radioBorde,
    overflowX: 'auto',
  },

  encabezado: {
    bgcolor: TABLAS.colores.encabezado,
  },

  encabezadoCelda: {
    color: TABLAS.colores.encabezadoTexto,
    fontWeight: TABLAS.tipografia.grosorEncabezado,
    fontSize: TABLAS.tipografia.encabezado,
    py: TABLAS.espaciado.encabezadoVertical,
    whiteSpace: 'nowrap',
    borderBottom: 0,
  },

  filaFiltros: {
    bgcolor: TABLAS.colores.filtros,
  },

  filtro: {
    minWidth: TABLAS.dimensiones.anchoMinimoFiltro,

    '& .MuiOutlinedInput-root': {
      bgcolor: TABLAS.colores.filtroFondo,
      borderRadius: 1,
      height: TABLAS.dimensiones.altoFiltro,
      fontSize: TABLAS.tipografia.filtros,
    },

    '& .MuiInputBase-input': {
      fontSize: TABLAS.tipografia.filtros,
    },
  },

  filtroFecha: {
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
