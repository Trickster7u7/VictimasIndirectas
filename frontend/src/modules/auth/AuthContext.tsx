import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type { UsuarioAutenticado } from './auth.types';
import {
  cerrarSesionLlaveMx,
  iniciarSesionLlaveMx,
  obtenerUsuarioActual,
} from './auth.service';

export interface ValorContextoAutenticacion {
  usuario: UsuarioAutenticado | null;
  autenticado: boolean;
  cargando: boolean;
  error: string | null;
  iniciarSesion: () => void;
  cerrarSesion: () => Promise<void>;
  actualizarUsuario: () => Promise<UsuarioAutenticado | null>;
}

export const ContextoAutenticacion =
  createContext<ValorContextoAutenticacion | undefined>(undefined);

interface PropiedadesProveedorAutenticacion {
  children: ReactNode;
}

export function ProveedorAutenticacion({
  children,
}: PropiedadesProveedorAutenticacion) {
  const [usuario, establecerUsuario] =
    useState<UsuarioAutenticado | null>(null);

  const [cargando, establecerCargando] =
    useState(true);

  const [error, establecerError] =
    useState<string | null>(null);

  const actualizarUsuario = useCallback(async () => {
    try {
      establecerCargando(true);
      establecerError(null);

      const respuesta = await obtenerUsuarioActual();
      establecerUsuario(respuesta.usuario);

      return respuesta.usuario;
    } catch {
      establecerUsuario(null);
      return null;
    } finally {
      establecerCargando(false);
    }
  }, []);

  useEffect(() => {
    void actualizarUsuario();
  }, [actualizarUsuario]);

  const iniciarSesion = () => {
    establecerError(null);
    iniciarSesionLlaveMx();
  };

  const cerrarSesion = async () => {
    try {
      establecerError(null);
      await cerrarSesionLlaveMx();
      establecerUsuario(null);
      sessionStorage.removeItem('validacion_activa_vista');
    } catch {
      const mensajeError = 'No fue posible cerrar la sesión.';
      establecerError(mensajeError);
      throw new Error(mensajeError);
    }
  };

  const autenticado = usuario !== null;

  return (
    <ContextoAutenticacion.Provider
      value={{
        usuario,
        autenticado,
        cargando,
        error,
        iniciarSesion,
        cerrarSesion,
        actualizarUsuario,
      }}
    >
      {children}
    </ContextoAutenticacion.Provider>
  );
}
