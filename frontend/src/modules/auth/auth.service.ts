import { CONFIGURACION_APLICACION } from '../../config/aplicacion.config';
import type { RespuestaSesion } from './auth.types';

const URL_API = CONFIGURACION_APLICACION.api.url;

export const iniciarSesionLlaveMx = (): void => {
  window.location.href =
    `${URL_API}/api/autenticacion/llave-mx/iniciar`;
};

export const obtenerUsuarioActual = async (): Promise<RespuestaSesion> => {
  const respuestaHttp = await fetch(
    `${URL_API}/api/autenticacion/sesion`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    }
  );

  if (!respuestaHttp.ok) {
    throw new Error('No existe una sesión activa');
  }

  return await respuestaHttp.json() as RespuestaSesion;
};

export const cerrarSesionLlaveMx = async (): Promise<void> => {
  const respuestaHttp = await fetch(
    `${URL_API}/api/autenticacion/cerrar-sesion`,
    {
      method: 'POST',
      credentials: 'include',
    }
  );

  if (!respuestaHttp.ok) {
    throw new Error('No fue posible cerrar la sesión');
  }
};
