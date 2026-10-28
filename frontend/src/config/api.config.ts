/** Endpoints únicos, sin cambiar el contrato de la API existente. */
export const API_RUTAS = {
  llaveMxIniciar: '/api/autenticacion/llave-mx/iniciar',
  sesion: '/api/autenticacion/sesion',
  cerrarSesion: '/api/autenticacion/cerrar-sesion',
  perfilInstitucional: '/api/usuarios/perfil-institucional',
} as const;
