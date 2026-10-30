export const CONFIGURACION_APLICACION = {
  nombre: 'Registro Nacional de Niñas, Niños y Adolescentes en Orfandad por Feminicidio',
  nombreCorto: 'RNNNAOF',
  descripcion: 'Plataforma institucional de servicios digitales',

  institucion: {
    nombre: ' Sistema Nacional para el Desarrollo Integral de la Familia',
    nombreCorto: 'SNDIF',
  },

  api: {
    url: import.meta.env.VITE_API_URL_QUAS || 'https://dtiviqa.dif.gob.mx',
  },

  rutas: {
    inicio: '/',
    inicioSesion: '/login',
    home: '/home',
    registroInstitucional: '/registro-institucional',
    pendienteValidacion: '/validacion/pendiente',
    rechazadoValidacion: '/validacion/rechazado',
    suspendido: '/suspendido',

    consultaRegistros: '/consulta-registros',
    resumenRegistros: '/resumen-registros',
    registroVictimas: '/registro-victimas',
    administracionUsuarios: '/administracion/usuarios',
  },
} as const;
