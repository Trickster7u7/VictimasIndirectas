import { useEffect, useState } from 'react';

import { consultarEntidades } from '../infrastructure/catalogos.service';
import type { Entidad } from '../domain/catalogos.types';


export function useEntidades() {

  const [entidades, setEntidades] = useState<Entidad[]>([]);
  const [cargandoEntidades, setCargandoEntidades] = useState(true);
  const [errorEntidades, setErrorEntidades] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    const cargarEntidades = async () => {
      try {
        setCargandoEntidades(true);
        setErrorEntidades(null);

        const respuesta = await consultarEntidades();

        if (activo) {
          setEntidades(respuesta);
        }

      } catch (error) {
        if (activo) {
          setErrorEntidades(
            error instanceof Error
              ? error.message
              : 'No fue posible cargar las entidades.'
          );
        }

      } finally {
        if (activo) {
          setCargandoEntidades(false);
        }
      }
    };

    cargarEntidades();

    return () => {
      activo = false;
    };

  }, []);

  return {
    entidades,
    cargandoEntidades,
    errorEntidades,
  };
}