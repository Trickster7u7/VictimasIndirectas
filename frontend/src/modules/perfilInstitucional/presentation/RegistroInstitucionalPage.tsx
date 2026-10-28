import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { usarRegistroInstitucional } from '../application/usarRegistroInstitucional';
import type { PerfilInstitucionalFormulario } from '../domain/perfilInstitucional.types';
import { usarAutenticacion } from '../../auth/application/usarAutenticacion';
import { obtenerRutaUsuario } from '../../auth/application/obtenerRutaUsuario';
import { TarjetaSeccion } from '../../../components/comunes/TarjetaSeccion';
import { PantallaCarga } from '../../../components/comunes/PantallaCarga';
import { CONFIGURACION_APLICACION } from '../../../config/aplicacion.config';

interface Campo { clave: keyof PerfilInstitucionalFormulario; etiqueta: string; maximo: number; requerido?: boolean; }
const CAMPOS: Campo[] = [
  { clave: 'institucion', etiqueta: 'Institución', maximo: 200, requerido: true },
  { clave: 'area', etiqueta: 'Área', maximo: 200 },
  { clave: 'cargo', etiqueta: 'Cargo', maximo: 200 },
  { clave: 'telefono_institucional', etiqueta: 'Teléfono institucional', maximo: 20 },
  { clave: 'entidad_federativa', etiqueta: 'Entidad federativa', maximo: 100 },
];

export function RegistroInstitucionalPage() {
  const navigate = useNavigate();
  const { usuario } = usarAutenticacion();
  const { formulario, cargando, enviando, error, cambiarCampo, enviar } = usarRegistroInstitucional();
  if (!usuario) return null;
  if (cargando) return <PantallaCarga mensaje="Cargando información institucional..." />;
  const esRechazado = usuario.estado === 'RECHAZADO';

  const onSubmit = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const resultado = await enviar();
    if (resultado.correcto) {
      navigate(resultado.estado ? obtenerRutaUsuario(resultado.estado) : CONFIGURACION_APLICACION.rutas.pendienteValidacion, { replace: true });
    }
  };
  return (
    <Stack spacing={2.5}>
      <Typography variant="body2" color="text.secondary">Completa los datos de tu institución para enviar tu perfil a validación.</Typography>
      {esRechazado && <Alert severity="warning">Tu registro requiere correcciones. Revisa los datos y vuelve a enviarlos.</Alert>}
      {error && <Alert severity="error" role="alert">{error}</Alert>}
      <TarjetaSeccion titulo="Datos de la institución" descripcion="Los campos marcados con * son obligatorios.">
        <Box component="form" onSubmit={(evento) => { void onSubmit(evento); }} noValidate={false}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2.3 }}>
            {CAMPOS.map(({ clave, etiqueta, maximo, requerido }) => (
              <TextField key={clave} id={clave} name={clave} label={etiqueta} required={requerido} fullWidth value={formulario[clave]} onChange={(evento) => cambiarCampo(clave, evento.target.value)} inputProps={{ maxLength: maximo, minLength: requerido ? 2 : undefined }} disabled={enviando} />
            ))}
          </Box>
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button type="submit" variant="contained" disabled={enviando} startIcon={enviando ? <CircularProgress size={17} color="inherit" /> : <SaveOutlinedIcon />}>
              {enviando ? 'Enviando...' : esRechazado ? 'Enviar correcciones' : 'Enviar a validación'}
            </Button>
          </Stack>
        </Box>
      </TarjetaSeccion>
    </Stack>
  );
}
