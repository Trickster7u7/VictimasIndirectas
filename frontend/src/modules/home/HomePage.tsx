import { useState } from 'react';

import { usarAutenticacion } from '../auth/usarAutenticacion';

export function HomePage() {
  const { usuario } = usarAutenticacion();
  const [mostrarAlerta, establecerMostrarAlerta] = useState(() => {
    return sessionStorage.getItem('validacion_activa_vista') !== '1';
  });

  if (!usuario) {
    return null;
  }

  const cerrarAlerta = () => {
    sessionStorage.setItem('validacion_activa_vista', '1');
    establecerMostrarAlerta(false);
  };

  return (
    <section className="pagina-home">
      {mostrarAlerta && (
        <div className="alerta alerta--exito alerta--cerrable" role="status">
          <div>
            <strong>Cuenta validada</strong>
            <p>
              Tu cuenta se encuentra activa. Ya puedes utilizar los módulos
              habilitados del sistema.
            </p>
          </div>

          <button
            type="button"
            className="alerta__cerrar"
            onClick={cerrarAlerta}
            aria-label="Cerrar aviso"
          >
            ×
          </button>
        </div>
      )}

      <header className="pagina-home__encabezado">
        <span className="etiqueta-seccion">Inicio</span>
        <h1>Bienvenido, {usuario.nombre}</h1>
        <p>
          Selecciona un módulo para continuar con la operación del sistema.
        </p>
      </header>

      <div className="rejilla-modulos">
        <article className="tarjeta-modulo">
          <span className="tarjeta-modulo__etiqueta">Disponible</span>
          <h2>Inicio</h2>
          <p>
            Tu usuario está activo y tiene acceso al sistema.
          </p>
        </article>
      </div>
    </section>
  );
}
