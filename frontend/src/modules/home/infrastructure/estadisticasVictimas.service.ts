import { CONFIGURACION_APLICACION } from '../../../config/aplicacion.config';

export interface EstadisticasVictimas {
  total_victimas: number;
  victimas_menores_18: number;
  registros_curp_invalida: number;
  fecha_consulta: string;
}

const API_URL = CONFIGURACION_APLICACION.api.url.replace(/\/+$/, '');

export async function consultarEstadisticasVictimas(
  signal?: AbortSignal,
): Promise<EstadisticasVictimas> {
  const respuesta = await fetch(`${API_URL}/api/estadisticas/victimas`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!respuesta.ok) {
    if (respuesta.status === 401) {
      throw new Error('Tu sesión ha expirado. Vuelve a iniciar sesión.');
    }
    if (respuesta.status === 403) {
      throw new Error('No tienes permisos para consultar las estadísticas.');
    }
    throw new Error(`No fue posible consultar los indicadores (HTTP ${respuesta.status}).`);
  }

  if (!respuesta.headers.get('content-type')?.includes('application/json')) {
    throw new Error('El backend no devolvió las estadísticas en formato JSON.');
  }

  return (await respuesta.json()) as EstadisticasVictimas;
}
