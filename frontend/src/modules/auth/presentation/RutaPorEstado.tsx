import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usarAutenticacion } from '../application/usarAutenticacion';
import { obtenerRutaUsuario } from '../application/obtenerRutaUsuario';
import type { EstadoUsuario } from '../domain/auth.types';
import { PantallaCarga } from '../../../components/comunes/PantallaCarga';
import { CONFIGURACION_APLICACION } from '../../../config/aplicacion.config';

interface Props { estadosPermitidos: EstadoUsuario[]; children: ReactNode; }
export function RutaPorEstado({ estadosPermitidos, children }: Props) {
  const { usuario, cargando } = usarAutenticacion();
  if (cargando) return <PantallaCarga mensaje="Validando estado de usuario..." />;
  if (!usuario) return <Navigate to={CONFIGURACION_APLICACION.rutas.inicioSesion} replace />;
  if (!estadosPermitidos.includes(usuario.estado)) return <Navigate to={obtenerRutaUsuario(usuario.estado)} replace />;
  return children;
}
