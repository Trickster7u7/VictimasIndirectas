import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usarAutenticacion } from '../../auth/application/usarAutenticacion';
import { obtenerRutaUsuario } from '../../auth/application/obtenerRutaUsuario';
import { EstadoPantalla } from '../../../components/comunes/EstadoPantalla';

export function PendienteValidacionPage() {
  const navigate = useNavigate();
  const { actualizarUsuario } = usarAutenticacion();
  const [consultando, establecerConsultando] = useState(false);
  const [error, establecerError] = useState<string | null>(null);
  const consultar = async () => {
    try {
      establecerConsultando(true);
      establecerError(null);
      const usuario = await actualizarUsuario();
      if (usuario) navigate(obtenerRutaUsuario(usuario.estado), { replace: true });
      else establecerError('No se pudo confirmar tu sesión. Vuelve a ingresar si es necesario.');
    } catch {
      establecerError('No fue posible consultar el estado en este momento.');
    } finally { establecerConsultando(false); }
  };
  return (
    <EstadoPantalla icono={<span aria-hidden="true" style={{ color: '#ed6c02', fontSize: 64 }}>⌛</span>} titulo="Información enviada" descripcion="Tu perfil institucional fue recibido correctamente y está pendiente de revisión.">
      <span style={{ color: '#ed6c02', border: '1px solid currentColor', borderRadius: 16, padding: '4px 12px' }}>Pendiente de validación</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', width: '100%' }}>
        {error && <div role="alert" style={{ width: '100%', color: '#d32f2f', border: '1px solid currentColor', borderRadius: 4, padding: 12 }}>{error}</div>}
        <button type="button" onClick={() => void consultar()} disabled={consultando} style={{ padding: '6px 16px', cursor: consultando ? 'default' : 'pointer' }}>
          {consultando ? 'Consultando...' : 'Consultar estado'}
        </button>
      </div>
    </EstadoPantalla>
  );
}
