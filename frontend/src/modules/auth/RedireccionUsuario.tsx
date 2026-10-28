import { Navigate } from 'react-router-dom';

import { usarAutenticacion } from './usarAutenticacion';
import { obtenerRutaUsuario } from './obtenerRutaUsuario';

export function RedireccionUsuario() {
  const {
    usuario,
    autenticado,
    cargando,
  } = usarAutenticacion();

  if (cargando) {
    return (
      <main className="pagina-cargando">
        <p>Validando sesión...</p>
      </main>
    );
  }

  if (!autenticado || !usuario) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={obtenerRutaUsuario(usuario.estado)}
      replace
    />
  );
}
