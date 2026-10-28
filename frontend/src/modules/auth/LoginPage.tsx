import { Navigate } from 'react-router-dom';

import { usarAutenticacion } from './usarAutenticacion';
import { obtenerRutaUsuario } from './obtenerRutaUsuario';
import { RECURSOS } from '../../config/recursos';
import { CONFIGURACION_APLICACION } from '../../config/aplicacion.config';

export function PaginaInicioSesion() {
  const {
    usuario,
    iniciarSesion,
    autenticado,
    cargando,
    error,
  } = usarAutenticacion();

  if (cargando) {
    return (
      <main className="pagina-cargando">
        <p>Validando sesión...</p>
      </main>
    );
  }

  if (autenticado && usuario) {
    return (
      <Navigate
        to={obtenerRutaUsuario(usuario.estado)}
        replace
      />
    );
  }

  return (
    <main className="pagina-autenticacion">
      <section
        className="panel-institucional"
        style={{
          backgroundImage: `url(${RECURSOS.fondos.llaveMx})`,
        }}
      >
        <div className="panel-institucional__contenido">
          <div className="tarjeta-logo-institucional">
            <img
              src={RECURSOS.logos.sndif.color}
              alt="Sistema Nacional DIF"
            />
          </div>

          <div>
            <p className="panel-institucional__etiqueta">
              Sistema Nacional DIF
            </p>

            <h1 className="panel-institucional__titulo">
              {CONFIGURACION_APLICACION.nombre}
            </h1>

            <p className="panel-institucional__descripcion">
              {CONFIGURACION_APLICACION.descripcion}
            </p>
          </div>
        </div>
      </section>

      <section
        className="panel-acceso"
        style={{
          backgroundImage: `url(${RECURSOS.fondos.llaveMx})`,
        }}
      >
        <div className="tarjeta-acceso">
          <img
            className="logo-llave-mx"
            src={RECURSOS.logos.llaveMx.principal}
            alt="Llave MX"
          />

          <h2 className="tarjeta-acceso__titulo">
            Iniciar sesión
          </h2>

          <p className="tarjeta-acceso__descripcion">
            Accede con tu cuenta Llave MX para continuar.
          </p>

          {error && (
            <p className="mensaje-error">
              {error}
            </p>
          )}

          <div className="acciones-login">
            <button
              type="button"
              className="boton-primario"
              onClick={iniciarSesion}
            >
              Iniciar sesión con Llave MX
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
