import type { UsuarioAutenticado } from '../domain/auth.types';

// Solo Vite en modo desarrollo puede habilitar el usuario simulado.
// Las compilaciones de producción siempre usan la autenticación real.
export const MODO_DESARROLLO =
  import.meta.env.DEV && import.meta.env.VITE_MODO_DESARROLLO === 'true';

export const USUARIO_DESARROLLO: UsuarioAutenticado = {
  id: 1,
  nombre: 'Diego',
  primer_apellido: 'González',
  segundo_apellido: null,
  correo: 'desarrollo@ejemplo.local',
  estado: 'ACTIVO',
};
