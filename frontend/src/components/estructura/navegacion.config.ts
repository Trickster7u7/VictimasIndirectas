import type { ElementType } from 'react';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import type { EstadoUsuario } from '../../modules/auth/domain/auth.types';
import { CONFIGURACION_APLICACION } from '../../config/aplicacion.config';
import { DownloadOutlined, ListAltOutlined } from '@mui/icons-material';

/** Configuración de navegación; no decide autorización: eso ocurre en RutaPorEstado. */
export interface EntradaMenu {
  texto: string;
  ruta: string;
  icono: ElementType;
  estados: readonly EstadoUsuario[];
}

const R = CONFIGURACION_APLICACION.rutas;

export const ENTRADAS_MENU: EntradaMenu[] = [
  { texto: 'Inicio', ruta: R.home, icono: HomeOutlinedIcon, estados: ['ACTIVO'] },
  { texto: 'Registro institucional', ruta: R.registroInstitucional, icono: AssignmentIndOutlinedIcon, estados: ['PENDIENTE_REGISTRO', 'RECHAZADO'] },
  { texto: 'Validación pendiente', ruta: R.pendienteValidacion, icono: FactCheckOutlinedIcon, estados: ['PENDIENTE_VALIDACION'] },
  { texto: 'Observaciones', ruta: R.rechazadoValidacion, icono: RateReviewOutlinedIcon, estados: ['RECHAZADO'] },
  { texto: 'Acceso suspendido', ruta: R.suspendido, icono: BlockOutlinedIcon, estados: ['SUSPENDIDO'] },
  { texto: 'Descarga de registros', ruta: R.consultaRegistros, icono: DownloadOutlined, estados: ['ACTIVO'] },
  { texto: 'Registros de víctimas', ruta: R.registroVictimas, icono: ListAltOutlined, estados: ['ACTIVO'] },
];

export const TITULOS_RUTA: Record<string, string> = {
  [R.home]: 'Inicio',
  [R.registroInstitucional]: 'Registro institucional',
  [R.pendienteValidacion]: 'Validación pendiente',
  [R.rechazadoValidacion]: 'Observaciones de validación',
  [R.suspendido]: 'Acceso suspendido',
  [R.consultaRegistros]: 'Descarga de registros',
  [R.registroVictimas]: 'Registros de víctimas',
};
