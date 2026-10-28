import { Navigate } from 'react-router-dom';
import { usarAutenticacion } from '../application/usarAutenticacion';
import { obtenerRutaUsuario } from '../application/obtenerRutaUsuario';
import { PantallaCarga } from '../../../components/comunes/PantallaCarga';
import { CONFIGURACION_APLICACION } from '../../../config/aplicacion.config';

export function RedireccionUsuario() {
  const { usuario, cargando } = usarAutenticacion();
  if (cargando) return <PantallaCarga mensaje="Validando sesión..." />;
  if (!usuario) return <Navigate to={CONFIGURACION_APLICACION.rutas.inicioSesion} replace />;
  return <Navigate to={obtenerRutaUsuario(usuario.estado)} replace />;
}
