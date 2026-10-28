import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';

import {
  usarAutenticacion,
} from '../auth/usarAutenticacion';

import {
  guardarPerfilInstitucional,
  obtenerPerfilInstitucional,
} from './perfilInstitucional.service';

import type {
  PerfilInstitucionalFormulario,
} from './perfilInstitucional.types';


const FORMULARIO_INICIAL:
  PerfilInstitucionalFormulario = {

    institucion: '',
    area: '',
    cargo: '',
    telefono_institucional: '',
    entidad_federativa: '',
  };


export function PerfilInstitucionalPage() {

  const {
    usuario,
    actualizarUsuario,
  } = usarAutenticacion();


  const [
    formulario,
    establecerFormulario,
  ] = useState<PerfilInstitucionalFormulario>(
    FORMULARIO_INICIAL
  );

  const [
    cargando,
    establecerCargando,
  ] = useState(true);

  const [
    enviando,
    establecerEnviando,
  ] = useState(false);

  const [
    mensaje,
    establecerMensaje,
  ] = useState<string | null>(null);

  const [
    error,
    establecerError,
  ] = useState<string | null>(null);

  const [
    observaciones,
    establecerObservaciones,
  ] = useState<string | null>(null);


  useEffect(() => {

    const cargarPerfil = async () => {

      try {

        establecerCargando(true);

        const respuesta =
          await obtenerPerfilInstitucional();

        if (!respuesta) {
          return;
        }

        const perfil = respuesta.perfil;

        establecerFormulario({
          institucion:
            perfil.institucion ?? '',
          area:
            perfil.area ?? '',
          cargo:
            perfil.cargo ?? '',
          telefono_institucional:
            perfil.telefono_institucional ?? '',
          entidad_federativa:
            perfil.entidad_federativa ?? '',
        });

        establecerObservaciones(
          perfil.observaciones_validacion
        );

      } catch (error) {

        establecerError(
          error instanceof Error
            ? error.message
            : 'No fue posible cargar el perfil.'
        );

      } finally {

        establecerCargando(false);
      }
    };


    cargarPerfil();

  }, []);


  if (!usuario) {
    return null;
  }


  const puedeEditar =
    usuario.estado === 'PENDIENTE_REGISTRO'
    || usuario.estado === 'RECHAZADO';


  const manejarCambio = (
    evento: ChangeEvent<HTMLInputElement>
  ) => {

    const {
      name,
      value,
    } = evento.target;

    establecerFormulario(
      estadoAnterior => ({
        ...estadoAnterior,
        [name]: value,
      })
    );
  };


  const enviarFormulario = async (
    evento: FormEvent<HTMLFormElement>
  ) => {

    evento.preventDefault();

    try {

      establecerEnviando(true);
      establecerError(null);
      establecerMensaje(null);

      const respuesta =
        await guardarPerfilInstitucional(
          formulario
        );

      establecerMensaje(
        respuesta.mensaje
      );

      await actualizarUsuario();

    } catch (error) {

      establecerError(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al guardar.'
      );

    } finally {

      establecerEnviando(false);
    }
  };


  if (cargando) {

    return (
      <div className="perfil-institucional__estado">
        Cargando información...
      </div>
    );
  }


  return (
    <section className="perfil-institucional">

      <header className="perfil-institucional__encabezado">

        <span className="etiqueta-seccion">
          Registro
        </span>

        <h1>
          Perfil institucional
        </h1>

        <p>
          Complete la información institucional
          necesaria para validar su acceso al sistema.
        </p>

      </header>


      <div className="perfil-institucional__usuario">

        <div>

          <span className="perfil-institucional__etiqueta">
            Usuario autenticado con Llave MX
          </span>

          <strong>
            {[
              usuario.nombre,
              usuario.primer_apellido,
              usuario.segundo_apellido,
            ]
              .filter(Boolean)
              .join(' ')}
          </strong>

        </div>


        <span
          className={
            `estado-usuario estado-usuario--${usuario.estado.toLowerCase()}`
          }
        >
          {usuario.estado.replaceAll('_', ' ')}
        </span>

      </div>


      {usuario.estado === 'PENDIENTE_VALIDACION' && (

        <div className="mensaje-estado mensaje-estado--pendiente">

          <strong>
            Perfil pendiente de validación
          </strong>

          <p>
            Su información fue enviada correctamente
            y actualmente se encuentra en revisión.
          </p>

        </div>

      )}


      {usuario.estado === 'RECHAZADO' && (

        <div className="mensaje-estado mensaje-estado--error">

          <strong>
            El perfil requiere correcciones
          </strong>

          <p>
            {observaciones
              ?? 'Revise la información y vuelva a enviarla.'}
          </p>

        </div>

      )}


      {usuario.estado === 'ACTIVO' && (

        <div className="mensaje-estado mensaje-estado--correcto">

          <strong>
            Perfil validado
          </strong>

          <p>
            Su perfil institucional se encuentra
            activo.
          </p>

        </div>

      )}


      {error && (

        <div className="mensaje-estado mensaje-estado--error">
          {error}
        </div>

      )}


      {mensaje && (

        <div className="mensaje-estado mensaje-estado--correcto">
          {mensaje}
        </div>

      )}


      <form
        className="formulario-institucional"
        onSubmit={enviarFormulario}
      >

        <div className="formulario-institucional__rejilla">

          <div className="campo-formulario">

            <label htmlFor="institucion">
              Institución *
            </label>

            <input
              id="institucion"
              name="institucion"
              value={formulario.institucion}
              onChange={manejarCambio}
              disabled={!puedeEditar}
              required
              minLength={2}
              maxLength={200}
            />

          </div>


          <div className="campo-formulario">

            <label htmlFor="area">
              Área
            </label>

            <input
              id="area"
              name="area"
              value={formulario.area}
              onChange={manejarCambio}
              disabled={!puedeEditar}
              maxLength={200}
            />

          </div>


          <div className="campo-formulario">

            <label htmlFor="cargo">
              Cargo
            </label>

            <input
              id="cargo"
              name="cargo"
              value={formulario.cargo}
              onChange={manejarCambio}
              disabled={!puedeEditar}
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
              value={
                formulario.telefono_institucional
              }
              onChange={manejarCambio}
              disabled={!puedeEditar}
              maxLength={20}
            />

          </div>


          <div className="campo-formulario campo-formulario--completo">

            <label htmlFor="entidad_federativa">
              Entidad federativa
            </label>

            <input
              id="entidad_federativa"
              name="entidad_federativa"
              value={
                formulario.entidad_federativa
              }
              onChange={manejarCambio}
              disabled={!puedeEditar}
              maxLength={100}
            />

          </div>

        </div>


        {puedeEditar && (

          <div className="formulario-institucional__acciones">

            <button
              type="submit"
              className="boton-primario"
              disabled={enviando}
            >
              {enviando
                ? 'Enviando...'
                : usuario.estado === 'RECHAZADO'
                  ? 'Enviar correcciones'
                  : 'Enviar a validación'}
            </button>

          </div>

        )}

      </form>

    </section>
  );
}