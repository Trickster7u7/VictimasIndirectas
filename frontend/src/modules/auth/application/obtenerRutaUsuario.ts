import type { EstadoUsuario } from '../domain/auth.types';
import { CONFIGURACION_APLICACION } from '../../../config/aplicacion.config';

/** Mapa único de estados del backend a pantallas. */
export const obtenerRutaUsuario = (estado: EstadoUsuario): string => {
  const r = CONFIGURACION_APLICACION.rutas;
  switch (estado) {
    case 'PENDIENTE_REGISTRO': return r.registroInstitucional;
    case 'PENDIENTE_VALIDACION': return r.pendienteValidacion;
    case 'RECHAZADO': return r.rechazadoValidacion;
    case 'ACTIVO': return r.home;
    case 'SUSPENDIDO': return r.suspendido;
    default: return r.inicioSesion;
  }
};
