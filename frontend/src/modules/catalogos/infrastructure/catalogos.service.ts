import { CONFIGURACION_APLICACION } from '../../../config/aplicacion.config';

import type { Entidad } from '../domain/catalogos.types';


const API_URL = CONFIGURACION_APLICACION.api.url.replace(/\/+$/, '');


export async function consultarEntidades(): Promise<Entidad[]> {

  const respuesta = await fetch(
    `${API_URL}/api/catalogos/entidades`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    }
  );

  if (!respuesta.ok) {
    throw new Error(
      `No fue posible consultar las entidades (HTTP ${respuesta.status}).`
    );
  }

  return (await respuesta.json()) as Entidad[];
}