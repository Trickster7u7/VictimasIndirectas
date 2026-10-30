import type { ReactNode } from 'react';
import { Alert, Box } from '@mui/material';
import { PantallaCarga } from '../../../components/comunes/PantallaCarga';
import { usarPermisos } from '../application/PermisosContext';

interface Props {
  permiso: string;
  children: ReactNode;
}

export function RutaConPermiso({ permiso, children }: Props) {
  const { cargandoPermisos, errorPermisos, tienePermiso } = usarPermisos();

  if (cargandoPermisos) return <PantallaCarga mensaje="Consultando permisos de acceso..." />;

  if (errorPermisos) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{errorPermisos} Actualiza la página para volver a intentarlo.</Alert>
      </Box>
    );
  }

  if (!tienePermiso(permiso)) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning">No tienes permisos para acceder a esta sección.</Alert>
      </Box>
    );
  }

  return <>{children}</>;
}
