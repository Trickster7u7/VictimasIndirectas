import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { usarAutenticacion } from './usarAutenticacion';
import { obtenerRutaUsuario } from './obtenerRutaUsuario';
import type { EstadoUsuario } from './auth.types';

interface PropiedadesRutaPorEstado {
  estadosPermitidos: EstadoUsuario[];
  children: ReactNode;
}

export function RutaPorEstado({
  estadosPermitidos,
  children,
}: PropiedadesRutaPorEstado) {
  const {
    usuario,
    cargando,
  } = usarAutenticacion();

  if (cargando) {
    return (
      <main className="pagina-cargando">
        <p>Validando estado de usuario...</p>
      </main>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!estadosPermitidos.includes(usuario.estado)) {
    return (
      <Navigate
        to={obtenerRutaUsuario(usuario.estado)}
        replace
      />
    );
  }

  return children;
}
