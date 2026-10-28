import {
  useContext,
} from 'react';

import {
  ContextoAutenticacion,
} from './AuthContext';


export function usarAuth() {

  const context =
    useContext(ContextoAutenticacion);


  if (!context) {

    throw new Error(
      'useAuth debe utilizarse dentro de AuthProvider'
    );

  }


  return context;
}