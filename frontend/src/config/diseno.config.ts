/** Fuente única para ajustar identidad visual, dimensiones y presentación. */
export const DISENO = {
  colores: {
    guinda: '#611232',
    guindaOscuro: '#450C27',
    guindaClaro: '#8F3156',
    activo: '#A54B70',
    dorado: '#B38E5D',
    fondo: '#F7F7F8',
    papel: '#FFFFFF',
    texto: '#24252B',
    textoSecundario: '#686871',
    borde: '#E4E4E8',
  },
  estructura: {
    altoEncabezadoPrincipal: 66,
    altoEncabezadoSecundario: 36,
    anchoMenu: 258,
    anchoMenuCompacto: 72,
    anchoContenido: 1440,
  },
  marca: {
    leyendaEncabezado: 'Registro Nacional de Niñas, Niños y Adolescentes en Orfandad por Feminicidio (RNNNAOF) - SNDIF',
    leyendaMenu: 'Versión 1.0.1 - DTI - SNDIF',
    version: 'Versión Institucional 1.0.1 - DTI - SNDIF',
  },
} as const;

export const ALTO_ENCABEZADO =
  DISENO.estructura.altoEncabezadoPrincipal + DISENO.estructura.altoEncabezadoSecundario;
