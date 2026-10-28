/** Consultas del histórico de víctimas almacenado en PostgreSQL mediante FastAPI. */
import { CONFIGURACION_APLICACION } from '../../../config/aplicacion.config';

const API_URL = CONFIGURACION_APLICACION.api.url.replace(/\/+$/, '');

export interface RegistroHistorico {
  id_registro: number;
  mes: number;
  anio: number;
  origen: string;
  estado_descarga: string;
  verificado_api: boolean;
  fecha_descarga: string | null;
  curp: string | null;
  nombre_completo: string;
  edad: number | null;
  fecha_hechos: string | null;
  entidad_hechos: string | null;
  numero_carpeta: string | null;
}

export interface RespuestaHistorico {
  pagina: number;
  limite: number;
  total: number;
  paginas: number;
  registros: RegistroHistorico[];
}

export interface FiltrosHistorico {
  pagina: number;
  limite: number;
  curp?: string;
  nombre?: string;
  fecha_hechos?: string;
  edad?: number;
  entidad?: string;
  numero_carpeta?: string;
  mes?: number;
  anio?: number;
}

export interface DetalleVictima {
  id_registro: number;
  mes: number;
  anio: number;
  origen: string;
  campos: Record<string, string | number | null>;
}

export type EstadoSincronizacion =
  | 'completado'
  | 'pendiente'
  | 'error'
  | 'en_proceso'
  | 'requiere_revision'
  | 'programado';

export interface PeriodoSincronizacion {
  anio: number;
  mes: number;
  estado: EstadoSincronizacion;
  elegible: boolean;
  origen: string | null;
  verificado_api: boolean;
  cantidad_registros: number;
  fecha_descarga: string | null;
}

export interface EstadoSincronizacionVictimas {
  fecha_consulta: string;
  proxima_ejecucion: string;
  ultima_descarga: string | null;
  puede_sincronizar: boolean;
  total_periodos: number;
  completados: number;
  pendientes: number;
  requieren_revision: number;
  periodos: PeriodoSincronizacion[];
}

export interface ResultadoSincronizacion {
  estado: string;
  mensaje: string;
  anio: number;
  mes: number;
  total?: number;
  recibidos?: number;
  nuevos?: number;
  total_guardados?: number;
}

async function solicitarJSON<T>(ruta: string): Promise<T> {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  if (!respuesta.ok) {
    if (respuesta.status === 401) {
      throw new Error('Tu sesión no está activa. Inicia sesión para consultar los registros.');
    }
    if (respuesta.status === 403) {
      throw new Error('No tienes permisos para consultar estos registros.');
    }
    if (respuesta.status === 404) {
      throw new Error('No se encontró el recurso solicitado en FastAPI (HTTP 404).');
    }
    throw new Error(`La consulta al backend falló (HTTP ${respuesta.status}).`);
  }

  const tipo = respuesta.headers.get('content-type') ?? '';
  if (!tipo.includes('json')) {
    throw new Error('El backend no devolvió JSON. Revisa la URL de la API y la sesión.');
  }

  return (await respuesta.json()) as T;
}

export async function consultarHistoricoVictimas(
  filtros: FiltrosHistorico,
): Promise<RespuestaHistorico> {
  const parametros = new URLSearchParams();
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor === undefined || valor === null || String(valor).trim() === '') continue;
    parametros.set(clave, String(valor));
  }

  return solicitarJSON<RespuestaHistorico>(
    `/api/registros-victimas/historico?${parametros.toString()}`,
  );
}

/** Listado de candidatas: FastAPI aplica edad y validación estructural de CURP. */
export async function consultarCandidatasRenapo(
  filtros: FiltrosHistorico,
): Promise<RespuestaHistorico> {
  const parametros = new URLSearchParams();
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor === undefined || valor === null || String(valor).trim() === '') continue;
    parametros.set(clave, String(valor));
  }

  return solicitarJSON<RespuestaHistorico>(
    `/api/registro-victimas/candidatas-renapo?${parametros.toString()}`,
  );
}

export async function consultarDetalleVictima(idRegistro: number): Promise<DetalleVictima> {
  if (!Number.isSafeInteger(idRegistro) || idRegistro <= 0) {
    throw new Error('El identificador de registro no es válido.');
  }

  return solicitarJSON<DetalleVictima>(
    `/api/registros-victimas/historico/${idRegistro}`,
  );
}

export function consultarEstadoSincronizacion(): Promise<EstadoSincronizacionVictimas> {
  return solicitarJSON<EstadoSincronizacionVictimas>(
    '/api/registros-victimas/sincronizacion/estado',
  );
}

export async function sincronizarPeriodoVictimas(
  anio: number,
  mes: number,
): Promise<ResultadoSincronizacion> {
  const parametros = new URLSearchParams({ anio: String(anio), mes: String(mes) });
  const respuesta = await fetch(
    `${API_URL}/api/registros-victimas/sincronizacion?${parametros.toString()}`,
    { method: 'POST', credentials: 'include', headers: { Accept: 'application/json' } },
  );

  const contenido = respuesta.headers.get('content-type')?.includes('json')
    ? await respuesta.json()
    : null;
  if (!respuesta.ok) {
    if (respuesta.status === 401) throw new Error('La sesión ha expirado. Vuelve a iniciar sesión.');
    if (respuesta.status === 403) throw new Error('No tienes permisos para sincronizar víctimas.');
    const detalle = contenido?.detail;
    throw new Error(typeof detalle === 'string'
      ? detalle
      : `No fue posible sincronizar el periodo (HTTP ${respuesta.status}).`);
  }
  return contenido as ResultadoSincronizacion;
}
