import { CONFIGURACION_APLICACION } from '../../config/aplicacion.config';
import type {
  PerfilInstitucionalFormulario,
  RespuestaGuardarPerfilInstitucional,
  RespuestaPerfilInstitucional,
} from './perfilInstitucional.types';

const URL_API = CONFIGURACION_APLICACION.api.url;

const obtenerMensajeError = async (
  respuesta: Response,
  mensajePredeterminado: string
): Promise<string> => {
  try {
    const datos = await respuesta.json() as {
      detail?: string | Array<{ msg?: string }>;
    };

    if (typeof datos.detail === 'string') {
      return datos.detail;
    }

    if (Array.isArray(datos.detail)) {
      return datos.detail
        .map((detalle) => detalle.msg)
        .filter(Boolean)
        .join('. ') || mensajePredeterminado;
    }
  } catch {
    // La API no devolvió JSON. Se usa el mensaje predeterminado.
  }

  return mensajePredeterminado;
};

export const obtenerPerfilInstitucional = async ():
Promise<RespuestaPerfilInstitucional | null> => {
  const respuesta = await fetch(
    `${URL_API}/api/usuarios/perfil-institucional`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    }
  );

  if (respuesta.status === 404) {
    return null;
  }

  if (!respuesta.ok) {
    throw new Error(
      await obtenerMensajeError(
        respuesta,
        'No fue posible obtener el perfil institucional.'
      )
    );
  }

  return await respuesta.json() as RespuestaPerfilInstitucional;
};

export const guardarPerfilInstitucional = async (
  datos: PerfilInstitucionalFormulario
): Promise<RespuestaGuardarPerfilInstitucional> => {
  const limpiarOpcional = (valor: string): string | null => {
    const valorLimpio = valor.trim();
    return valorLimpio.length > 0 ? valorLimpio : null;
  };

  const respuesta = await fetch(
    `${URL_API}/api/usuarios/perfil-institucional`,
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        institucion: datos.institucion.trim(),
        area: limpiarOpcional(datos.area),
        cargo: limpiarOpcional(datos.cargo),
        telefono_institucional: limpiarOpcional(
          datos.telefono_institucional
        ),
        entidad_federativa: limpiarOpcional(
          datos.entidad_federativa
        ),
      }),
    }
  );

  if (!respuesta.ok) {
    throw new Error(
      await obtenerMensajeError(
        respuesta,
        'No fue posible guardar el perfil institucional.'
      )
    );
  }

  return await respuesta.json() as RespuestaGuardarPerfilInstitucional;
};
