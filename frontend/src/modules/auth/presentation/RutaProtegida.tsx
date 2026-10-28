import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usarAutenticacion } from '../application/usarAutenticacion';
import { PantallaCarga } from '../../../components/comunes/PantallaCarga';
import { CONFIGURACION_APLICACION } from '../../../config/aplicacion.config';

interface Props { children: ReactNode; }
export function RutaProtegida({ children }: Props) {
  const { autenticado, cargando } = usarAutenticacion();
  if (cargando) return <PantallaCarga mensaje="Validando sesión..." />;
  if (!autenticado) return <Navigate to={CONFIGURACION_APLICACION.rutas.inicioSesion} replace />;
  return children;
}
