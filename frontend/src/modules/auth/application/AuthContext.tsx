import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import type { UsuarioAutenticado } from '../domain/auth.types';
import { cerrarSesionLlaveMx, iniciarSesionLlaveMx, obtenerUsuarioActual } from '../infrastructure/auth.service';
import { MODO_DESARROLLO, USUARIO_DESARROLLO } from './modoDesarrollo';

export interface ValorContextoAutenticacion {
  usuario: UsuarioAutenticado | null;
  autenticado: boolean;
  cargando: boolean;
  error: string | null;
  iniciarSesion: () => void;
  cerrarSesion: () => Promise<void>;
  actualizarUsuario: () => Promise<UsuarioAutenticado | null>;
}

export const ContextoAutenticacion = createContext<ValorContextoAutenticacion | undefined>(undefined);

export function ProveedorAutenticacion({ children }: { children: ReactNode }) {
  const [usuario, establecerUsuario] = useState<UsuarioAutenticado | null>(
    MODO_DESARROLLO ? USUARIO_DESARROLLO : null
  );
  const [cargando, establecerCargando] = useState(!MODO_DESARROLLO);
  const [error, establecerError] = useState<string | null>(null);

  const actualizarUsuario = useCallback(async () => {
    if (MODO_DESARROLLO) {
      establecerUsuario(USUARIO_DESARROLLO);
      establecerError(null);
      return USUARIO_DESARROLLO;
    }
    try {
      establecerError(null);
      const respuesta = await obtenerUsuarioActual();
      const siguiente = respuesta.autenticado ? respuesta.usuario : null;
      establecerUsuario(siguiente);
      return siguiente;
    } catch {
      establecerUsuario(null);
      return null;
    }
  }, []);

  useEffect(() => {
    if (MODO_DESARROLLO) return;
    let vigente = true;
    const verificar = async () => {
      await actualizarUsuario();
      if (vigente) establecerCargando(false);
    };
    void verificar();
    return () => { vigente = false; };
  }, [actualizarUsuario]);

  const iniciarSesion = () => {
    establecerError(null);
    if (MODO_DESARROLLO) {
      establecerUsuario(USUARIO_DESARROLLO);
      return;
    }
    iniciarSesionLlaveMx();
  };

  const cerrarSesion = async () => {
    if (MODO_DESARROLLO) {
      // El usuario simulado permanece activo mientras esté habilitado el modo demo.
      sessionStorage.removeItem('validacion_activa_vista');
      return;
    }
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

  return (
    <ContextoAutenticacion.Provider value={{
      usuario,
      autenticado: usuario !== null,
      cargando,
      error,
      iniciarSesion,
      cerrarSesion,
      actualizarUsuario,
    }}>
      {children}
    </ContextoAutenticacion.Provider>
  );
}
