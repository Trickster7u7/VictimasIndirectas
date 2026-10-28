import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { usarAutenticacion } from '../auth/usarAutenticacion';
import { obtenerRutaUsuario } from '../auth/obtenerRutaUsuario';
import {
  guardarPerfilInstitucional,
  obtenerPerfilInstitucional,
} from './perfilInstitucional.service';
import type { PerfilInstitucionalFormulario } from './perfilInstitucional.types';

const FORMULARIO_INICIAL: PerfilInstitucionalFormulario = {
  institucion: '',
  area: '',
  cargo: '',
  telefono_institucional: '',
  entidad_federativa: '',
};

export function RegistroInstitucionalPage() {
  const navigate = useNavigate();
  const {
    usuario,
    actualizarUsuario,
  } = usarAutenticacion();

  const [formulario, establecerFormulario] =
    useState<PerfilInstitucionalFormulario>(FORMULARIO_INICIAL);
  const [cargando, establecerCargando] = useState(true);
  const [enviando, establecerEnviando] = useState(false);
  const [error, establecerError] = useState<string | null>(null);

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        establecerCargando(true);
        establecerError(null);

        const respuesta = await obtenerPerfilInstitucional();

        if (!respuesta) {
          return;
        }

        const perfil = respuesta.perfil;

        establecerFormulario({
          institucion: perfil.institucion ?? '',
          area: perfil.area ?? '',
          cargo: perfil.cargo ?? '',
          telefono_institucional: perfil.telefono_institucional ?? '',
          entidad_federativa: perfil.entidad_federativa ?? '',
        });
      } catch (errorCarga) {
        establecerError(
          errorCarga instanceof Error
            ? errorCarga.message
            : 'No fue posible cargar la información institucional.'
        );
      } finally {
        establecerCargando(false);
      }
    };

    void cargarPerfil();
  }, []);

  if (!usuario) {
    return null;
  }

  const manejarCambio = (evento: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = evento.target;

    establecerFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  const enviarFormulario = async (
    evento: FormEvent<HTMLFormElement>
  ) => {
    evento.preventDefault();

    if (formulario.institucion.trim().length < 2) {
      establecerError('La institución debe tener al menos 2 caracteres.');
      return;
    }

    try {
      establecerEnviando(true);
      establecerError(null);

      await guardarPerfilInstitucional(formulario);

      const usuarioActualizado = await actualizarUsuario();

      navigate(
        usuarioActualizado
          ? obtenerRutaUsuario(usuarioActualizado.estado)
          : '/validacion/pendiente',
        { replace: true }
      );
    } catch (errorEnvio) {
      establecerError(
        errorEnvio instanceof Error
          ? errorEnvio.message
          : 'No fue posible enviar la información.'
      );
    } finally {
      establecerEnviando(false);
    }
  };

  if (cargando) {
    return (
      <section className="pagina-estado">
        <div className="tarjeta-estado">
          <p>Cargando información institucional...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pagina-registro-institucional">
      <header className="pagina-registro-institucional__encabezado">
        <span className="etiqueta-seccion">Registro</span>
        <h1>Perfil institucional</h1>
        <p>
          Completa la información requerida para enviar tu cuenta a validación.
        </p>
      </header>

      {usuario.estado === 'RECHAZADO' && (
        <div className="alerta alerta--advertencia">
          Tu registro fue rechazado. Corrige los datos solicitados y vuelve a
          enviarlos para validación.
        </div>
      )}

      {error && (
        <div className="alerta alerta--error" role="alert">
          {error}
        </div>
      )}

      <form
        className="tarjeta-formulario"
        onSubmit={enviarFormulario}
      >
        <div className="rejilla-formulario">
          <div className="campo-formulario">
            <label htmlFor="institucion">Institución *</label>
            <input
              id="institucion"
              name="institucion"
              value={formulario.institucion}
              onChange={manejarCambio}
              minLength={2}
              maxLength={200}
              required
            />
          </div>

          <div className="campo-formulario">
            <label htmlFor="area">Área</label>
            <input
              id="area"
              name="area"
              value={formulario.area}
              onChange={manejarCambio}
              maxLength={200}
            />
          </div>

          <div className="campo-formulario">
            <label htmlFor="cargo">Cargo</label>
            <input
              id="cargo"
              name="cargo"
              value={formulario.cargo}
              onChange={manejarCambio}
              maxLength={200}
            />
          </div>

          <div className="campo-formulario">
            <label htmlFor="telefono_institucional">
              Teléfono institucional
            </label>
            <input
              id="telefono_institucional"
              name="telefono_institucional"
              value={formulario.telefono_institucional}
              onChange={manejarCambio}
              maxLength={20}
            />
          </div>

          <div className="campo-formulario campo-formulario--completo">
            <label htmlFor="entidad_federativa">Entidad federativa</label>
            <input
              id="entidad_federativa"
              name="entidad_federativa"
              value={formulario.entidad_federativa}
              onChange={manejarCambio}
              maxLength={100}
            />
          </div>
        </div>

        <div className="acciones-formulario">
          <button
            type="submit"
            className="boton-primario boton-primario--contenido"
            disabled={enviando}
          >
            {enviando
              ? 'Enviando...'
              : usuario.estado === 'RECHAZADO'
                ? 'Enviar correcciones'
                : 'Enviar a validación'}
          </button>
        </div>
      </form>
    </section>
  );
}
