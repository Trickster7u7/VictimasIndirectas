import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import { EstadoPantalla } from '../../../components/comunes/EstadoPantalla';

export function SuspendidoPage() {
  return <EstadoPantalla icono={<BlockOutlinedIcon color="error" sx={{ fontSize: 64 }} />} titulo="Acceso suspendido" descripcion="Tu cuenta se encuentra suspendida y no puede acceder a los módulos del sistema. Contacta con el área administradora si necesitas aclaraciones." />;
}
