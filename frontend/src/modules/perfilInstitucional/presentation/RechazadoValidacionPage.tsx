import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { obtenerPerfilInstitucional } from '../infrastructure/perfilInstitucional.service';
import { EstadoPantalla } from '../../../components/comunes/EstadoPantalla';
import { CONFIGURACION_APLICACION } from '../../../config/aplicacion.config';

export function RechazadoValidacionPage() {
  const navigate = useNavigate();
  const [observaciones, establecerObservaciones] = useState<string | null>(null);
  const [cargando, establecerCargando] = useState(true);
  const [error, establecerError] = useState<string | null>(null);
  useEffect(() => {
    let vigente = true;
    const cargar = async () => {
      try {
        const resultado = await obtenerPerfilInstitucional();
        if (vigente) establecerObservaciones(resultado?.perfil.observaciones_validacion ?? null);
      } catch (err) {
        if (vigente) establecerError(err instanceof Error ? err.message : 'No fue posible consultar las observaciones.');
      } finally { if (vigente) establecerCargando(false); }
    };
    void cargar();
    return () => { vigente = false; };
  }, []);
  return (
    <EstadoPantalla icono={<ReportProblemOutlinedIcon color="warning" sx={{ fontSize: 64 }} />} titulo="Tu registro requiere correcciones" descripcion="Revisa las observaciones del área responsable y actualiza la información institucional.">
      <Stack spacing={2} sx={{ width: '100%', textAlign: 'left' }}>
        {cargando ? <CircularProgress size={24} sx={{ alignSelf: 'center' }} /> : error ? <Alert severity="error">{error}</Alert> : <Alert severity="warning"><Typography variant="subtitle2">Observaciones</Typography><Typography variant="body2">{observaciones || 'Revisa tu información institucional y vuelve a enviarla.'}</Typography></Alert>}
        <Button variant="contained" startIcon={<EditNoteOutlinedIcon />} onClick={() => navigate(CONFIGURACION_APLICACION.rutas.registroInstitucional)}>Corregir información</Button>
      </Stack>
    </EstadoPantalla>
  );
}
