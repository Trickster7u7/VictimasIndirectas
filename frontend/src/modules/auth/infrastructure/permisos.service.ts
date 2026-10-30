import { CONFIGURACION_APLICACION } from '../../../config/aplicacion.config';

const URL_API = CONFIGURACION_APLICACION.api.url.replace(/\/+$/, '');

/** La API calcula los permisos efectivos por rol directo y grupos activos. */
export async function obtenerMisPermisos(signal?: AbortSignal): Promise<string[]> {
  const respuesta = await fetch(`${URL_API}/api/usuarios/mis-permisos`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!respuesta.ok) {
    if (respuesta.status === 401) throw new Error('La sesión ha expirado.');
    if (respuesta.status === 403) throw new Error('No tienes acceso para consultar tus permisos.');
    throw new Error(`No fue posible cargar los permisos (HTTP ${respuesta.status}).`);
  }

  if (!respuesta.headers.get('content-type')?.includes('application/json')) {
    throw new Error('La API no respondió con los permisos en formato JSON.');
  }

  const datos: unknown = await respuesta.json();
  if (!Array.isArray(datos) || !datos.every((codigo) => typeof codigo === 'string')) {
    throw new Error('La API devolvió una lista de permisos inválida.');
  }

  return datos;
}
