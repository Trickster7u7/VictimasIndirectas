import { Navigate } from 'react-router-dom';
import { usarAutenticacion } from '../application/usarAutenticacion';
import { obtenerRutaUsuario } from '../application/obtenerRutaUsuario';
import { RECURSOS } from '../../../config/recursos';
import { CONFIGURACION_APLICACION } from '../../../config/aplicacion.config';
import { PantallaCarga } from '../../../components/comunes/PantallaCarga';
import '../../../styles/llavemx.css';

/** El acceso no utiliza el layout privado ni inventa un flujo OAuth en el frontend. */
export function PaginaInicioSesion() {
  const { usuario, iniciarSesion, autenticado, cargando, error } = usarAutenticacion();
  if (cargando) return <PantallaCarga mensaje="Validando sesión con Llave MX..." />;
  if (autenticado && usuario) return <Navigate to={obtenerRutaUsuario(usuario.estado)} replace />;

  return (
    <main className="lmx-wrapper">
      <div className="lmx-page">
        <section className="lmx-left" aria-label="Información institucional" style={{ backgroundImage: `url(${RECURSOS.fondos.llaveMx})` }}>
          <div className="lmx-left__content">
            <h1 className="lmx-left__title">{CONFIGURACION_APLICACION.nombre}</h1>
            <div className="lmx-inst-card">
              <img src={RECURSOS.logos.sndif.color} alt="Sistema Nacional DIF" />
            </div>
          </div>
        </section>
        <section className="lmx-right" aria-label="Acceso con Llave MX" style={{ backgroundImage: `url(${RECURSOS.fondos.llaveMx})` }}>
          <div className="lmx-card">
            <img className="lmx-card__logo" src={RECURSOS.logos.llaveMx.principal} alt="Llave MX" />
            <p className="lmx-card__terminos">
              Para ingresar, utiliza tu cuenta de Llave MX. Consulta los Términos y Condiciones y el Aviso de Privacidad del servicio oficial.
            </p>
            {error && <p className="lmx-error" role="alert">{error}</p>}
            <div className="lmx-btns">
              <button type="button" className="lmx-btn-outline" disabled title="Pendiente de configurar la ruta oficial de registro">Crear cuenta</button>
              <button type="button" className="lmx-btn-solid" onClick={iniciarSesion}>Iniciar sesión</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
