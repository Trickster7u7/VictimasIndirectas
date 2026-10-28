import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { obtenerPerfilInstitucional } from './perfilInstitucional.service';

export function RechazadoValidacionPage() {
  const navigate = useNavigate();
  const [observaciones, establecerObservaciones] =
    useState<string | null>(null);
  const [cargando, establecerCargando] = useState(true);
  const [error, establecerError] = useState<string | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const respuesta = await obtenerPerfilInstitucional();
        establecerObservaciones(
          respuesta?.perfil.observaciones_validacion ?? null
        );
      } catch (errorCarga) {
        establecerError(
          errorCarga instanceof Error
            ? errorCarga.message
            : 'No fue posible consultar las observaciones.'
        );
      } finally {
        establecerCargando(false);
      }
    };

    void cargar();
  }, []);

  return (
    <section className="pagina-estado">
      <div className="tarjeta-estado tarjeta-estado--rechazado">
        <div className="tarjeta-estado__icono" aria-hidden="true">
          ⚠
        </div>

        <span className="etiqueta-seccion">Validación</span>
        <h1>Tu registro requiere correcciones</h1>

        {cargando ? (
          <p>Consultando observaciones...</p>
        ) : error ? (
          <div className="alerta alerta--error" role="alert">
            {error}
          </div>
        ) : (
          <div className="observaciones-validacion">
            <strong>Observaciones</strong>
            <p>
              {observaciones ||
                'Revisa la información institucional y vuelve a enviarla.'}
            </p>
          </div>
        )}

        <button
          type="button"
          className="boton-primario boton-primario--contenido"
          onClick={() => navigate('/registro-institucional')}
        >
          Corregir información
        </button>
      </div>
    </section>
  );
}
