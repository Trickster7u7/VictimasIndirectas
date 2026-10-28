export type EstadoUsuario =
  | 'PENDIENTE_REGISTRO'
  | 'PENDIENTE_VALIDACION'
  | 'ACTIVO'
  | 'RECHAZADO'
  | 'SUSPENDIDO';

export interface UsuarioAutenticado {
  id: number;
  nombre: string;
  primer_apellido: string;
  segundo_apellido: string | null;
  correo: string | null;
  estado: EstadoUsuario;
}

export interface RespuestaSesion {
  autenticado: boolean;
  usuario: UsuarioAutenticado | null;
}
