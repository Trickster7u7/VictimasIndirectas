import type { EstadoUsuario } from './auth.types';

export const obtenerRutaUsuario = (
  estado: EstadoUsuario
): string => {
  switch (estado) {
    case 'PENDIENTE_REGISTRO':
      return '/registro-institucional';

    case 'PENDIENTE_VALIDACION':
      return '/validacion/pendiente';

    case 'RECHAZADO':
      return '/validacion/rechazado';

    case 'ACTIVO':
      return '/home';

    case 'SUSPENDIDO':
      return '/suspendido';

    default:
      return '/login';
  }
};
