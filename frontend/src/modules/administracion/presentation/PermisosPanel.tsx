import { useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Checkbox, CircularProgress, FormControlLabel,
  FormGroup, MenuItem, Paper, Stack, TextField, Typography,
} from '@mui/material';
import {
  AdministracionAPI,
  type Permiso,
  type Rol,
} from '../infrastructure/administracion.service';

interface Props { roles: Rol[]; permisos: Permiso[] }

export function PermisosPanel({ roles, permisos }: Props) {
  const [idRol, setIdRol] = useState<number>(0);
  const [idsPermisos, setIdsPermisos] = useState<number[]>([]);
  const [cargando, setCargando] = useState(false);
  const [datosValidos, setDatosValidos] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const rolSeleccionado = roles.find((r) => r.id === idRol);
  const esAdmin = rolSeleccionado?.codigo === 'ADMINISTRADOR';

  const porModulo = useMemo(() => {
    return permisos.reduce<Record<string, Permiso[]>>((anterior, permiso) => {
      (anterior[permiso.modulo] ??= []).push(permiso);
      return anterior;
    }, {});
  }, [permisos]);

  useEffect(() => {
    if (!idRol) return;
    let vigente = true;
    setCargando(true);
    setDatosValidos(false);
    setError(null);
    setAviso(null);
    AdministracionAPI.permisosRol(idRol)
      .then((dato) => {
        if (vigente) { setIdsPermisos(dato.ids_permisos); setDatosValidos(true); }
      })
      .catch((motivo: unknown) => {
        if (vigente) setError(motivo instanceof Error ? motivo.message : 'No se pudieron obtener permisos.');
      })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [idRol]);

  async function guardar() {
    if (!idRol || esAdmin || guardando || !datosValidos) return;
    if (!window.confirm(
      `Los permisos de ${rolSeleccionado?.nombre} cambiarán para todos los usuarios con este rol. ¿Continuar?`
    )) return;

    setGuardando(true);
    setError(null);
    setAviso(null);
    try {
      const actualizado = await AdministracionAPI.guardarPermisosRol(idRol, idsPermisos);
      setIdsPermisos(actualizado.ids_permisos);
      setAviso('Permisos guardados y cambio registrado en auditoría.');
    } catch (motivo) {
      setError(motivo instanceof Error ? motivo.message : 'No se pudieron guardar los permisos.');
    } finally { setGuardando(false); }
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Permisos de cada rol</Typography>
      <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
        Cada cambio se aplicará a todos los usuarios que tengan el rol, directamente o por grupos.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {aviso && <Alert severity="success" sx={{ mb: 2 }}>{aviso}</Alert>}
      <TextField size="small" select fullWidth label="Rol" value={idRol}
        onChange={(e) => {
          setDatosValidos(false); setIdsPermisos([]); setIdRol(Number(e.target.value));
        }}
        sx={{ mb: 2 }}>
        <MenuItem value={0}>Seleccionar rol…</MenuItem>
        {roles.map((r) => <MenuItem key={r.id} value={r.id}>{r.nombre} ({r.codigo})</MenuItem>)}
      </TextField>

      {esAdmin && <Alert severity="info" sx={{ mb: 2 }}>
        ADMINISTRADOR tiene todos los permisos por diseño. No pueden modificarse desde esta matriz.
      </Alert>}
      {rolSeleccionado && (cargando ? <CircularProgress /> : datosValidos && (
        <>
          <Stack spacing={2}>
            {Object.entries(porModulo).map(([modulo, lista]) => (
              <Paper key={modulo} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography fontWeight={700} sx={{ mb: 1 }}>{modulo}</Typography>
                <FormGroup>
                  {lista.map((permiso) => {
                    const administrativo = permiso.codigo.startsWith('usuarios.') ||
                      permiso.codigo.startsWith('grupos.') ||
                      permiso.codigo.startsWith('roles.');
                    return (
                      <FormControlLabel key={permiso.id}
                        control={<Checkbox checked={idsPermisos.includes(permiso.id)}
                          disabled={guardando || esAdmin || administrativo}
                          onChange={(e) => setIdsPermisos((anteriores) => e.target.checked
                            ? [...anteriores, permiso.id]
                            : anteriores.filter((id) => id !== permiso.id))} />}
                        label={
                          <Box>
                            <Typography variant="body2">{permiso.nombre}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {permiso.codigo}{administrativo && !esAdmin ? ' · Exclusivo de administrador' : ''}
                            </Typography>
                          </Box>
                        }
                      />
                    );
                  })}
                </FormGroup>
              </Paper>
            ))}
          </Stack>
          {!esAdmin && (
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" disabled={guardando}
                onClick={() => { void guardar(); }}>
                Guardar permisos del rol
              </Button>
            </Box>
          )}
          <Alert severity="warning" sx={{ mt: 2 }}>
            El permiso de sincronización no sustituye la lista de usuarios autorizados
            para consumir SSPC. Los usuarios deberán volver a cargar su sesión para actualizar la interfaz.
          </Alert>
        </>
      ))}
    </Box>
  );
}
