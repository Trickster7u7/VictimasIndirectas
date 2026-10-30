import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Checkbox, CircularProgress, Divider,
  FormControlLabel, FormGroup, MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import {
  AdministracionAPI,
  type Grupo,
  type Rol,
} from '../infrastructure/administracion.service';

interface Props { grupos: Grupo[]; roles: Rol[]; alCambiar: () => Promise<void> }

export function GruposPanel({ grupos, roles, alCambiar }: Props) {
  const [idGrupo, setIdGrupo] = useState<number>(0);
  const [idsRoles, setIdsRoles] = useState<number[]>([]);
  const [cargando, setCargando] = useState(false);
  const [datosValidos, setDatosValidos] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    if (!idGrupo) return;
    let vigente = true;
    setCargando(true);
    setDatosValidos(false);
    setError(null);
    AdministracionAPI.rolesGrupo(idGrupo)
      .then((dato) => {
        if (vigente) { setIdsRoles(dato.roles.map((r) => r.id)); setDatosValidos(true); }
      })
      .catch((motivo: unknown) => {
        if (vigente) setError(motivo instanceof Error ? motivo.message : 'Error al consultar el grupo.');
      })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [idGrupo]);

  async function crear() {
    if (guardando) return;
    setGuardando(true);
    setError(null);
    setAviso(null);
    try {
      const grupo = await AdministracionAPI.crearGrupo({
        codigo: codigo.trim().toUpperCase(),
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
      });
      await alCambiar();
      setCodigo(''); setNombre(''); setDescripcion('');
      setIdGrupo(grupo.id);
      setAviso('Grupo creado. Ahora asígnale los roles que corresponden.');
    } catch (motivo) {
      setError(motivo instanceof Error ? motivo.message : 'No se pudo crear el grupo.');
    } finally { setGuardando(false); }
  }

  async function guardarRoles() {
    if (!idGrupo || guardando || cargando || !datosValidos) return;
    if (!window.confirm(
      `Cambiar los roles de ${grupoSeleccionado?.nombre ?? 'este grupo'} afectará a todos sus usuarios. ¿Confirmas?`
    )) return;
    setGuardando(true);
    setError(null);
    setAviso(null);
    try {
      await AdministracionAPI.guardarRolesGrupo(idGrupo, idsRoles);
      setAviso('Roles del grupo actualizados correctamente.');
    } catch (motivo) {
      setError(motivo instanceof Error ? motivo.message : 'No se pudieron guardar los roles.');
    } finally { setGuardando(false); }
  }

  const grupoSeleccionado = grupos.find((g) => g.id === idGrupo);

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Grupos de usuarios</Typography>
      <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
        Los usuarios heredan los permisos de los roles asignados a sus grupos.
        Cambiar un grupo afecta a todos sus integrantes.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {aviso && <Alert severity="success" sx={{ mb: 2 }}>{aviso}</Alert>}

      <TextField select fullWidth label="Selecciona un grupo existente" size="small"
        value={idGrupo} sx={{ mb: 2 }} onChange={(e) => {
          setDatosValidos(false); setIdsRoles([]); setIdGrupo(Number(e.target.value));
        }}>
        <MenuItem value={0}>Seleccionar…</MenuItem>
        {grupos.map((g) => (
          <MenuItem key={g.id} value={g.id}>{g.nombre} ({g.codigo})</MenuItem>
        ))}
      </TextField>

      {grupoSeleccionado && (
        <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}>
          <Typography fontWeight={700} sx={{ mb: 1 }}>
            Roles de {grupoSeleccionado.nombre}
          </Typography>
          {cargando ? <CircularProgress size={24} /> : (
            <FormGroup>
              {roles.filter((r) => r.codigo !== 'ADMINISTRADOR').map((r) => (
                <FormControlLabel key={r.id}
                  control={<Checkbox checked={idsRoles.includes(r.id)}
                    disabled={guardando || !grupoSeleccionado.activo || !datosValidos}
                    onChange={(e) => setIdsRoles((actual) => e.target.checked
                      ? [...actual, r.id] : actual.filter((id) => id !== r.id))} />}
                  label={`${r.nombre} (${r.codigo})`} />
              ))}
            </FormGroup>
          )}
          <Button sx={{ mt: 1 }} variant="contained" disabled={guardando || cargando || !datosValidos || !grupoSeleccionado.activo}
            onClick={() => { void guardarRoles(); }}>Guardar roles del grupo</Button>
        </Box>
      )}

      <Divider sx={{ my: 3 }} />
      <Typography fontWeight={700} sx={{ mb: 1 }}>Crear un grupo</Typography>
      <Stack spacing={1.5}>
        <TextField fullWidth size="small" label="Código (ej. UNIDAD_NORTE)" value={codigo}
          inputProps={{ maxLength: 50 }} onChange={(e) => setCodigo(e.target.value.toUpperCase())} />
        <TextField fullWidth size="small" label="Nombre" value={nombre}
          inputProps={{ maxLength: 120 }} onChange={(e) => setNombre(e.target.value)} />
        <TextField fullWidth size="small" multiline minRows={2} label="Descripción (opcional)"
          value={descripcion} inputProps={{ maxLength: 1000 }}
          onChange={(e) => setDescripcion(e.target.value)} />
        <Box>
          <Button variant="outlined" disabled={guardando || !/^[A-Z][A-Z0-9_]{2,49}$/.test(codigo.trim()) || nombre.trim().length < 3}
            onClick={() => { void crear(); }}>
            Crear grupo
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
