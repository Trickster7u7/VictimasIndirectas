import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usarAutenticacion } from './usarAutenticacion';
import { obtenerMisPermisos } from '../infrastructure/permisos.service';

interface EstadoPermisos {
  idUsuario: number | null;
  permisos: string[];
  cargando: boolean;
  error: string | null;
}

interface ValorContextoPermisos {
  permisos: readonly string[];
  cargandoPermisos: boolean;
  errorPermisos: string | null;
  tienePermiso: (codigo: string) => boolean;
}

const ContextoPermisos = createContext<ValorContextoPermisos | undefined>(undefined);

export function ProveedorPermisos({ children }: { children: ReactNode }) {
  const { usuario, cargando: cargandoSesion } = usarAutenticacion();
  const [estado, establecerEstado] = useState<EstadoPermisos>({
    idUsuario: null,
    permisos: [],
    cargando: false,
    error: null,
  });

  const idUsuario = usuario?.estado === 'ACTIVO' ? usuario.id : null;

  useEffect(() => {
    if (cargandoSesion || idUsuario === null) {
      establecerEstado({ idUsuario: null, permisos: [], cargando: false, error: null });
      return;
    }

    const controlador = new AbortController();
    establecerEstado({ idUsuario, permisos: [], cargando: true, error: null });

    obtenerMisPermisos(controlador.signal)
      .then((permisos) => {
        if (!controlador.signal.aborted) {
          establecerEstado({ idUsuario, permisos, cargando: false, error: null });
        }
      })
      .catch((motivo: unknown) => {
        if (!controlador.signal.aborted) {
          establecerEstado({
            idUsuario,
            permisos: [], // Si hay un error, no se muestra ninguna ruta protegida.
            cargando: false,
            error: motivo instanceof Error ? motivo.message : 'No se pudieron consultar los permisos.',
          });
        }
      });

    return () => controlador.abort();
  }, [idUsuario, cargandoSesion]);

  // No conservar los permisos de una cuenta si cambia la sesión.
  const coincideUsuario = idUsuario !== null && estado.idUsuario === idUsuario;
  const permisos = coincideUsuario ? estado.permisos : [];
  const cargandoPermisos = idUsuario !== null && (!coincideUsuario || estado.cargando);
  const errorPermisos = coincideUsuario ? estado.error : null;

  return (
    <ContextoPermisos.Provider
      value={{
        permisos,
        cargandoPermisos,
        errorPermisos,
        tienePermiso: (codigo) => permisos.includes(codigo),
      }}
    >
      {children}
    </ContextoPermisos.Provider>
  );
}

export function usarPermisos(): ValorContextoPermisos {
  const contexto = useContext(ContextoPermisos);
  if (!contexto) {
    throw new Error('usarPermisos debe utilizarse dentro de ProveedorPermisos.');
  }
  return contexto;
}
