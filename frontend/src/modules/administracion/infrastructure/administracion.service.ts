import { CONFIGURACION_APLICACION } from '../../../config/aplicacion.config';

const BASE = `${CONFIGURACION_APLICACION.api.url.replace(/\/+$/, '')}/api/usuarios`;

export type EstadoCuenta =
  | 'PENDIENTE_REGISTRO'
  | 'PENDIENTE_VALIDACION'
  | 'ACTIVO'
  | 'RECHAZADO'
  | 'SUSPENDIDO';

export interface UsuarioAdministracion {
  id: number;
  nombre: string;
  primer_apellido: string;
  segundo_apellido: string | null;
  correo: string | null;
  estado: EstadoCuenta;
}

export interface PaginaUsuarios {
  usuarios: UsuarioAdministracion[];
  total: number;
  pagina: number;
  limite: number;
}

export interface Rol {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}

export interface Grupo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface Permiso {
  id: number;
  codigo: string;
  nombre: string;
  modulo: string;
}

interface RolesUsuario { id_usuario: number; roles: Rol[] }
interface GruposUsuario { id_usuario: number; grupos: Grupo[] }
interface RolesGrupo { id_grupo: number; roles: Rol[] }
interface PermisosRol { id_rol: number; ids_permisos: number[] }

async function solicitar<T>(ruta: string, metodo = 'GET', cuerpo?: unknown): Promise<T> {
  const respuesta = await fetch(`${BASE}${ruta}`, {
    method: metodo,
    credentials: 'include',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      ...(cuerpo !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(cuerpo !== undefined ? { body: JSON.stringify(cuerpo) } : {}),
  });

  if (!respuesta.ok) {
    const mensajeBase = `Operación no completada (HTTP ${respuesta.status}).`;
    let mensaje = respuesta.status === 401
      ? 'Tu sesión expiró. Inicia sesión nuevamente.'
      : respuesta.status === 403
        ? 'No tienes permisos para realizar esta acción.'
        : mensajeBase;
    try {
      const error: unknown = await respuesta.json();
      if (error && typeof error === 'object' && 'detail' in error &&
          typeof error.detail === 'string') {
        mensaje = error.detail;
      }
    } catch { /* Puede ser una respuesta sin JSON. */ }
    throw new Error(mensaje);
  }

  if (!respuesta.headers.get('content-type')?.includes('application/json')) {
    throw new Error('El servidor no respondió con JSON.');
  }
  return respuesta.json() as Promise<T>;
}

export const AdministracionAPI = {
  listarUsuarios: (buscar: string, estado: string, pagina: number) => {
    const parametros = new URLSearchParams({ pagina: String(pagina), limite: '20' });
    if (buscar.trim()) parametros.set('buscar', buscar.trim());
    if (estado) parametros.set('estado', estado);
    return solicitar<PaginaUsuarios>(`/administracion/usuarios?${parametros}`);
  },
  listarRoles: () => solicitar<Rol[]>('/administracion/roles'),
  listarGrupos: () => solicitar<Grupo[]>('/administracion/grupos'),
  listarPermisos: () => solicitar<Permiso[]>('/administracion/permisos'),
  rolesUsuario: (id: number) => solicitar<RolesUsuario>(`/administracion/usuarios/${id}/roles`),
  gruposUsuario: (id: number) => solicitar<GruposUsuario>(`/administracion/usuarios/${id}/grupos`),
  guardarRolesUsuario: (id: number, ids_roles: number[]) =>
    solicitar<RolesUsuario>(`/administracion/usuarios/${id}/roles`, 'PUT', { ids_roles }),
  guardarGruposUsuario: (id: number, ids_grupos: number[]) =>
    solicitar<GruposUsuario>(`/administracion/usuarios/${id}/grupos`, 'PUT', { ids_grupos }),
  aprobarUsuario: (id: number, observaciones: string) =>
    solicitar<{ id_usuario: number; estado: EstadoCuenta }>(
      `/administracion/usuarios/${id}/aprobar`, 'POST', { observaciones: observaciones || null }
    ),
  rechazarUsuario: (id: number, observaciones: string) =>
    solicitar<{ id_usuario: number; estado: EstadoCuenta }>(
      `/administracion/usuarios/${id}/rechazar`, 'POST', { observaciones }
    ),
  rolesGrupo: (id: number) => solicitar<RolesGrupo>(`/administracion/grupos/${id}/roles`),
  guardarRolesGrupo: (id: number, ids_roles: number[]) =>
    solicitar<RolesGrupo>(`/administracion/grupos/${id}/roles`, 'PUT', { ids_roles }),
  crearGrupo: (datos: { codigo: string; nombre: string; descripcion: string | null }) =>
    solicitar<Grupo>('/administracion/grupos', 'POST', datos),
  permisosRol: (id: number) => solicitar<PermisosRol>(`/administracion/roles/${id}/permisos`),
  guardarPermisosRol: (id: number, ids_permisos: number[]) =>
    solicitar<PermisosRol>(`/administracion/roles/${id}/permisos`, 'PUT', { ids_permisos }),
};
