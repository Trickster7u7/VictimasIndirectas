import { CONFIGURACION_APLICACION } from '../../../config/aplicacion.config';

export interface ResumenPeriodo {
  anio: number;
  mes: number;
  total_registros: number;
}

const URL_API = CONFIGURACION_APLICACION.api.url.replace(/\/+$/, '');

export async function consultarResumenPeriodos(signal?: AbortSignal): Promise<ResumenPeriodo[]> {
  const respuesta = await fetch(`${URL_API}/api/estadisticas/registros-por-periodo`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!respuesta.ok) {
    if (respuesta.status === 401) throw new Error('La sesión ha expirado.');
    if (respuesta.status === 403) throw new Error('No tienes permiso para consultar el resumen.');
    throw new Error(`No fue posible cargar el resumen (HTTP ${respuesta.status}).`);
  }

  if (!respuesta.headers.get('content-type')?.includes('application/json')) {
    throw new Error('La API no devolvió un resumen en formato JSON.');
  }

  const datos: unknown = await respuesta.json();
  if (!Array.isArray(datos) || !datos.every((fila) =>
    typeof fila === 'object' && fila !== null &&
    Number.isInteger(fila.anio) && Number.isInteger(fila.mes) &&
    Number.isInteger(fila.total_registros) &&
    fila.mes >= 1 && fila.mes <= 12 && fila.total_registros >= 0
  )) {
    throw new Error('La API devolvió datos de resumen inválidos.');
  }

  return datos as ResumenPeriodo[];
}
