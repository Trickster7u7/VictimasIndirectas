import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { usarAutenticacion } from '../auth/usarAutenticacion';
import { obtenerRutaUsuario } from '../auth/obtenerRutaUsuario';

export function PendienteValidacionPage() {
  const navigate = useNavigate();
  const {
    actualizarUsuario,
  } = usarAutenticacion();
  const [consultando, establecerConsultando] = useState(false);

  const consultarEstado = async () => {
    try {
      establecerConsultando(true);
      const usuarioActualizado = await actualizarUsuario();

      if (usuarioActualizado) {
        navigate(
          obtenerRutaUsuario(usuarioActualizado.estado),
          { replace: true }
        );
      }
    } finally {
      establecerConsultando(false);
    }
  };

  return (
    <section className="pagina-estado">
      <div className="tarjeta-estado tarjeta-estado--pendiente">
        <div className="tarjeta-estado__icono" aria-hidden="true">
          ⏳
        </div>

        <span className="etiqueta-seccion">Validación</span>
        <h1>Información enviada</h1>
        <p>
          Tu perfil institucional fue recibido correctamente y se encuentra
          pendiente de validación.
        </p>

        <span className="insignia-estado">
          Pendiente de validación
        </span>

        <button
          type="button"
          className="boton-secundario"
          onClick={consultarEstado}
          disabled={consultando}
        >
          {consultando ? 'Consultando...' : 'Consultar estado'}
        </button>
      </div>
    </section>
  );
}
