import { useEffect, useState } from 'react';
import { guardarPerfilInstitucional, obtenerPerfilInstitucional } from '../infrastructure/perfilInstitucional.service';
import type { PerfilInstitucionalFormulario } from '../domain/perfilInstitucional.types';
import { usarAutenticacion } from '../../auth/application/usarAutenticacion';

const INICIAL: PerfilInstitucionalFormulario = {
  institucion: '', area: '', cargo: '', telefono_institucional: '', entidad_federativa: '',
};

/** Orquesta el caso de uso, sin depender de componentes visuales. */
export function usarRegistroInstitucional() {
  const { actualizarUsuario } = usarAutenticacion();
  const [formulario, establecerFormulario] = useState<PerfilInstitucionalFormulario>(INICIAL);
  const [cargando, establecerCargando] = useState(true);
  const [enviando, establecerEnviando] = useState(false);
  const [error, establecerError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    const cargar = async () => {
      try {
        const respuesta = await obtenerPerfilInstitucional();
        if (vigente && respuesta) {
          const p = respuesta.perfil;
          establecerFormulario({
            institucion: p.institucion ?? '', area: p.area ?? '', cargo: p.cargo ?? '',
            telefono_institucional: p.telefono_institucional ?? '', entidad_federativa: p.entidad_federativa ?? '',
          });
        }
      } catch (err) {
        if (vigente) establecerError(err instanceof Error ? err.message : 'No fue posible cargar la información institucional.');
      } finally {
        if (vigente) establecerCargando(false);
      }
    };
    void cargar();
    return () => { vigente = false; };
  }, []);

  const cambiarCampo = (campo: keyof PerfilInstitucionalFormulario, valor: string) => {
    establecerFormulario((actual) => ({ ...actual, [campo]: valor }));
  };

  const enviar = async () => {
    if (formulario.institucion.trim().length < 2) {
      establecerError('La institución debe tener al menos dos caracteres.');
      return { correcto: false as const, estado: null };
    }
    try {
      establecerEnviando(true);
      establecerError(null);
      await guardarPerfilInstitucional(formulario);
      const usuario = await actualizarUsuario();
      return { correcto: true as const, estado: usuario?.estado ?? null };
    } catch (err) {
      establecerError(err instanceof Error ? err.message : 'No fue posible enviar la información.');
      return { correcto: false as const, estado: null };
    } finally {
      establecerEnviando(false);
    }
  };

  return { formulario, cargando, enviando, error, cambiarCampo, enviar };
}
