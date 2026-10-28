import type {
  ReactNode,
} from 'react';

import {
  Navigate,
} from 'react-router-dom';

import {
  usarAutenticacion,
} from './usarAutenticacion';


interface PropiedadesRutaProtegida {
  children: ReactNode;
}


export function RutaProtegida({
  children,
}: PropiedadesRutaProtegida) {

  const {
    autenticado,
    cargando,
  } = usarAutenticacion();


  if (cargando) {

    return (
      <main className="pagina">
        <p>
          Validando sesión...
        </p>
      </main>
    );
  }


  if (!autenticado) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  return children;
}