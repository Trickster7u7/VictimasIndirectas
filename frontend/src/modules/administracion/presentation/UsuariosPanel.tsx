import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Checkbox, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, FormControlLabel, FormGroup, MenuItem,
  Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material';
import { usarAutenticacion } from '../../auth/application/usarAutenticacion';
import {
  AdministracionAPI,
  type EstadoCuenta,
  type Grupo,
  type PaginaUsuarios,
  type Rol,
  type UsuarioAdministracion,
} from '../infrastructure/administracion.service';

interface Props { roles: Rol[]; grupos: Grupo[] }
type AccionRevision = 'aprobar' | 'rechazar' | null;

const ESTADOS: { codigo: EstadoCuenta; nombre: string }[] = [
  { codigo: 'PENDIENTE_REGISTRO', nombre: 'Pendiente de registro' },
  { codigo: 'PENDIENTE_VALIDACION', nombre: 'Pendiente de validación' },
  { codigo: 'ACTIVO', nombre: 'Activo' },
  { codigo: 'RECHAZADO', nombre: 'Rechazado' },
  { codigo: 'SUSPENDIDO', nombre: 'Suspendido' },
];

function nombreCompleto(usuario: UsuarioAdministracion) {
  return [usuario.nombre, usuario.primer_apellido, usuario.segundo_apellido]
    .filter(Boolean).join(' ');
}

export function UsuariosPanel({ roles, grupos }: Props) {
  const { usuario: sesion } = usarAutenticacion();
  const [buscar, setBuscar] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('');
  const [pagina, setPagina] = useState(1);
  const [revision, setRevision] = useState(0);
  const [datos, setDatos] = useState<PaginaUsuarios | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const [seleccionado, setSeleccionado] = useState<UsuarioAdministracion | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [detalleValido, setDetalleValido] = useState(false);
  const [idsGrupos, setIdsGrupos] = useState<number[]>([]);
  const [idsRoles, setIdsRoles] = useState<number[]>([]);
  const [rolesOriginales, setRolesOriginales] = useState<number[]>([]);
  const [operando, setOperando] = useState(false);
  const [accionRevision, setAccionRevision] = useState<AccionRevision>(null);
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError(null);
    AdministracionAPI.listarUsuarios(busqueda, estado, pagina)
      .then((resultado) => { if (vigente) setDatos(resultado); })
      .catch((motivo: unknown) => {
        if (vigente) setError(motivo instanceof Error ? motivo.message : 'Error al listar usuarios.');
      })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [busqueda, estado, pagina, revision]);

  const mostrarError = (motivo: unknown) => {
    setError(motivo instanceof Error ? motivo.message : 'No se pudo completar la operación.');
  };

  async function abrirUsuario(usuario: UsuarioAdministracion) {
    setSeleccionado(usuario);
    setCargandoDetalle(true);
    setDetalleValido(false);
    setError(null);
    setAviso(null);
    setIdsGrupos([]);
    setIdsRoles([]);
    try {
      const [r, g] = await Promise.all([
        AdministracionAPI.rolesUsuario(usuario.id),
        AdministracionAPI.gruposUsuario(usuario.id),
      ]);
      setIdsRoles(r.roles.map((rol) => rol.id));
      setRolesOriginales(r.roles.map((rol) => rol.id));
      setIdsGrupos(g.grupos.map((grupo) => grupo.id));
      setDetalleValido(true);
    } catch (motivo) { mostrarError(motivo); }
    finally { setCargandoDetalle(false); }
  }

  async function guardar(tipo: 'roles' | 'grupos') {
    if (!seleccionado || operando || !detalleValido) return;
    if (tipo === 'roles') {
      const idAdministrador = roles.find((rol) => rol.codigo === 'ADMINISTRADOR')?.id;
      if (idAdministrador && idsRoles.includes(idAdministrador) &&
          !rolesOriginales.includes(idAdministrador) &&
          !window.confirm('Vas a otorgar acceso ADMINISTRADOR completo a esta cuenta. ¿Confirmas?')) {
        return;
      }
    }
    setOperando(true);
    setError(null);
    setAviso(null);
    try {
      if (tipo === 'roles') {
        await AdministracionAPI.guardarRolesUsuario(seleccionado.id, idsRoles);
        setRolesOriginales(idsRoles);
      } else {
        await AdministracionAPI.guardarGruposUsuario(seleccionado.id, idsGrupos);
      }
      setAviso(`Se actualizaron los ${tipo} del usuario ${seleccionado.id}.`);
      setRevision((anterior) => anterior + 1);
    } catch (motivo) { mostrarError(motivo); }
    finally { setOperando(false); }
  }

  async function ejecutarRevision() {
    if (!seleccionado || !accionRevision || operando) return;
    if (accionRevision === 'rechazar' && !observaciones.trim()) {
      setError('Para rechazar una solicitud debes escribir el motivo.');
      return;
    }
    setOperando(true);
    setError(null);
    try {
      if (accionRevision === 'aprobar') {
        await AdministracionAPI.aprobarUsuario(seleccionado.id, observaciones.trim());
      } else {
        await AdministracionAPI.rechazarUsuario(seleccionado.id, observaciones.trim());
      }
      setAviso(`La solicitud del usuario ${seleccionado.id} fue procesada.`);
      setSeleccionado(null);
      setAccionRevision(null);
      setObservaciones('');
      setRevision((anterior) => anterior + 1);
    } catch (motivo) {
      setAccionRevision(null);
      mostrarError(motivo);
    } finally { setOperando(false); }
  }

  const esMiCuenta = seleccionado?.id === sesion?.id;

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Usuarios</Typography>
      <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
        Los usuarios se registran con Llave MX. Aquí puedes validarlos y administrar sus accesos.
      </Typography>
      <Stack component="form" direction={{ xs: 'column', md: 'row' }} gap={1.5}
        onSubmit={(e) => { e.preventDefault(); setPagina(1); setBusqueda(buscar); }}
        sx={{ mb: 2 }}>
        <TextField
          size="small" label="Buscar por nombre, correo o ID" value={buscar}
          onChange={(e) => setBuscar(e.target.value)} sx={{ flexGrow: 1 }}
          inputProps={{ maxLength: 80 }}
        />
        <TextField select size="small" label="Estado" value={estado}
          onChange={(e) => { setEstado(e.target.value); setPagina(1); }}
          sx={{ minWidth: 215 }}>
          <MenuItem value="">Todos</MenuItem>
          {ESTADOS.map((item) => (
            <MenuItem key={item.codigo} value={item.codigo}>{item.nombre}</MenuItem>
          ))}
        </TextField>
        <Button type="submit" variant="contained">Buscar</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {aviso && <Alert severity="success" sx={{ mb: 2 }}>{aviso}</Alert>}

      {cargando ? <CircularProgress /> : (
        <>
          <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
            <Table size="small" aria-label="Usuarios del sistema">
              <TableHead sx={{ bgcolor: 'rgba(105, 31, 58, 0.09)' }}>
                <TableRow>
                  <TableCell>ID</TableCell><TableCell>Nombre</TableCell>
                  <TableCell>Correo</TableCell><TableCell>Estado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {datos?.usuarios.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{nombreCompleto(u)}</TableCell>
                    <TableCell>{u.correo || '—'}</TableCell>
                    <TableCell><Chip size="small" label={u.estado.replace(/_/g, ' ')}
                      color={u.estado === 'ACTIVO' ? 'success' : 'default'} /></TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => { void abrirUsuario(u); }}>
                        Administrar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!datos?.usuarios.length && (
                  <TableRow><TableCell colSpan={5}>No se encontraron usuarios.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {datos?.total ?? 0} usuario(s) · Página {pagina}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button disabled={pagina <= 1} onClick={() => setPagina((n) => n - 1)}>Anterior</Button>
              <Button disabled={!datos || pagina * datos.limite >= datos.total}
                onClick={() => setPagina((n) => n + 1)}>Siguiente</Button>
            </Stack>
          </Stack>
        </>
      )}

      <Dialog open={Boolean(seleccionado)} onClose={() => { if (!operando) setSeleccionado(null); }}
        fullWidth maxWidth="sm">
        <DialogTitle>Administrar usuario {seleccionado?.id}</DialogTitle>
        <DialogContent dividers>
          <Typography fontWeight={700}>{seleccionado && nombreCompleto(seleccionado)}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {seleccionado?.correo || 'Sin correo'} · {seleccionado?.estado}
          </Typography>
          {esMiCuenta && <Alert severity="info" sx={{ mb: 2 }}>
            No puedes modificar tus propios grupos ni roles.
          </Alert>}
          {cargandoDetalle ? <CircularProgress /> : (
            <>
              <Typography fontWeight={700}>Grupos</Typography>
              <Typography variant="caption" color="text.secondary">
                Los permisos se heredan de todos los grupos seleccionados.
              </Typography>
              <FormGroup sx={{ my: 1 }}>
                {grupos.filter((g) => g.activo || idsGrupos.includes(g.id)).map((g) => (
                  <FormControlLabel key={g.id}
                    control={<Checkbox size="small" checked={idsGrupos.includes(g.id)}
                      disabled={operando || esMiCuenta || !detalleValido || !g.activo}
                      onChange={(e) => setIdsGrupos((actual) => e.target.checked
                        ? [...actual, g.id] : actual.filter((id) => id !== g.id))} />}
                    label={`${g.nombre} (${g.codigo})`} />
                ))}
              </FormGroup>
              <Button variant="contained" size="small" disabled={operando || esMiCuenta || !detalleValido}
                onClick={() => { void guardar('grupos'); }}>Guardar grupos</Button>

              <Divider sx={{ my: 2 }} />
              <Typography fontWeight={700}>Roles directos</Typography>
              <Typography variant="caption" color="text.secondary">
                Reserva ADMINISTRADOR para cuentas autorizadas. Un rol directo se suma a los grupos.
              </Typography>
              <FormGroup sx={{ my: 1 }}>
                {roles.map((r) => (
                  <FormControlLabel key={r.id}
                    control={<Checkbox size="small" checked={idsRoles.includes(r.id)}
                      disabled={operando || esMiCuenta || !detalleValido}
                      onChange={(e) => setIdsRoles((actual) => e.target.checked
                        ? [...actual, r.id] : actual.filter((id) => id !== r.id))} />}
                    label={`${r.nombre} (${r.codigo})`} />
                ))}
              </FormGroup>
              <Button variant="outlined" size="small" disabled={operando || esMiCuenta || !detalleValido}
                onClick={() => { void guardar('roles'); }}>Guardar roles directos</Button>

              {seleccionado?.estado === 'PENDIENTE_VALIDACION' && !esMiCuenta && (
                <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                  <Button color="success" variant="contained" disabled={operando}
                    onClick={() => { setObservaciones(''); setAccionRevision('aprobar'); }}>
                    Aprobar usuario
                  </Button>
                  <Button color="error" variant="outlined" disabled={operando}
                    onClick={() => { setObservaciones(''); setAccionRevision('rechazar'); }}>
                    Rechazar
                  </Button>
                </Stack>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setSeleccionado(null)} disabled={operando}>
          Cerrar
        </Button></DialogActions>
      </Dialog>

      <Dialog open={accionRevision !== null} onClose={() => { if (!operando) setAccionRevision(null); }}
        fullWidth maxWidth="xs">
        <DialogTitle>{accionRevision === 'aprobar' ? 'Confirmar aprobación' : 'Confirmar rechazo'}</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            ¿Confirmas esta decisión para el usuario {seleccionado?.id}?
          </Typography>
          <TextField multiline minRows={2} fullWidth label={accionRevision === 'rechazar'
            ? 'Motivo del rechazo (obligatorio)' : 'Observaciones (opcional)'}
            value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAccionRevision(null)} disabled={operando}>Cancelar</Button>
          <Button color={accionRevision === 'rechazar' ? 'error' : 'success'}
            variant="contained" disabled={operando || (accionRevision === 'rechazar' && !observaciones.trim())}
            onClick={() => { void ejecutarRevision(); }}>Confirmar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
