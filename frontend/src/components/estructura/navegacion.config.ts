import type { ElementType } from 'react';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import { DownloadOutlined, ListAltOutlined } from '@mui/icons-material';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import type { EstadoUsuario } from '../../modules/auth/domain/auth.types';
import { CONFIGURACION_APLICACION } from '../../config/aplicacion.config';

/** Las rutas ACTIVO requieren permiso. La autorización definitiva se hace en FastAPI. */
export interface EntradaMenu {
  texto: string;
  ruta: string;
  icono: ElementType;
  estados: readonly EstadoUsuario[];
  permiso?: string;
}

const R = CONFIGURACION_APLICACION.rutas;

export const ENTRADAS_MENU: EntradaMenu[] = [
  { texto: 'Inicio', ruta: R.home, icono: HomeOutlinedIcon, estados: ['ACTIVO'], permiso: 'estadisticas.consultar' },
  { texto: 'Registro institucional', ruta: R.registroInstitucional, icono: AssignmentIndOutlinedIcon, estados: ['PENDIENTE_REGISTRO', 'RECHAZADO'] },
  { texto: 'Validación pendiente', ruta: R.pendienteValidacion, icono: FactCheckOutlinedIcon, estados: ['PENDIENTE_VALIDACION'] },
  { texto: 'Observaciones', ruta: R.rechazadoValidacion, icono: RateReviewOutlinedIcon, estados: ['RECHAZADO'] },
  { texto: 'Acceso suspendido', ruta: R.suspendido, icono: BlockOutlinedIcon, estados: ['SUSPENDIDO'] },
  { texto: 'Descarga de registros', ruta: R.consultaRegistros, icono: DownloadOutlined, estados: ['ACTIVO'], permiso: 'registros.consultar' },
  { texto: 'Registros de víctimas', ruta: R.registroVictimas, icono: ListAltOutlined, estados: ['ACTIVO'], permiso: 'victimas.consultar' },
  { texto: 'Administración', ruta: R.administracionUsuarios, icono: ManageAccountsOutlinedIcon, estados: ['ACTIVO'], permiso: 'usuarios.consultar' },
];

export const TITULOS_RUTA: Record<string, string> = {
  [R.home]: 'Inicio',
  [R.registroInstitucional]: 'Registro institucional',
  [R.pendienteValidacion]: 'Validación pendiente',
  [R.rechazadoValidacion]: 'Observaciones de validación',
  [R.suspendido]: 'Acceso suspendido',
  [R.consultaRegistros]: 'Descarga de registros',
  [R.resumenRegistros]: 'Resumen de registros',
  [R.registroVictimas]: 'Registros de víctimas',
  [R.administracionUsuarios]: 'Administración de usuarios y permisos',
};
