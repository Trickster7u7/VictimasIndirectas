import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, CircularProgress, Paper, Tab, Tabs, Typography,
} from '@mui/material';
import {
  AdministracionAPI,
  type Grupo,
  type Permiso,
  type Rol,
} from '../infrastructure/administracion.service';
import { UsuariosPanel } from './UsuariosPanel';
import { GruposPanel } from './GruposPanel';
import { PermisosPanel } from './PermisosPanel';

export function AdministracionPage() {
  const [pestana, setPestana] = useState(0);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargarCatalogos = useCallback(async () => {
    const [rolesNuevos, gruposNuevos, permisosNuevos] = await Promise.all([
      AdministracionAPI.listarRoles(),
      AdministracionAPI.listarGrupos(),
      AdministracionAPI.listarPermisos(),
    ]);
    setRoles(rolesNuevos);
    setGrupos(gruposNuevos);
    setPermisos(permisosNuevos);
  }, []);

  useEffect(() => {
    let activo = true;
    Promise.all([
      AdministracionAPI.listarRoles(),
      AdministracionAPI.listarGrupos(),
      AdministracionAPI.listarPermisos(),
    ]).then(([r, g, p]) => {
      if (activo) { setRoles(r); setGrupos(g); setPermisos(p); }
    }).catch((e: unknown) => {
      if (activo) setError(e instanceof Error ? e.message : 'No se pudo cargar la administración.');
    }).finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, []);

  return (
    <Box sx={{ pb: 4 }}>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Gestiona usuarios, grupos y permisos sin modificar la base de datos manualmente.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {cargando ? <CircularProgress aria-label="Cargando administración" /> : (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Tabs
            value={pestana}
            onChange={(_evento, valor: number) => setPestana(valor)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Usuarios" />
            <Tab label="Grupos" />
            <Tab label="Roles y permisos" />
          </Tabs>
          <Box sx={{ p: { xs: 1.5, md: 3 } }}>
            {pestana === 0 && <UsuariosPanel roles={roles} grupos={grupos} />}
            {pestana === 1 && (
              <GruposPanel
                grupos={grupos}
                roles={roles}
                alCambiar={recargarCatalogos}
              />
            )}
            {pestana === 2 && <PermisosPanel roles={roles} permisos={permisos} />}
          </Box>
        </Paper>
      )}
    </Box>
  );
}
