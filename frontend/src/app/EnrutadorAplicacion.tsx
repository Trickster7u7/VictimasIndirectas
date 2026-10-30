import { Navigate, Route, Routes } from 'react-router-dom';

import { LayoutPrincipal } from '../components/estructura/LayoutPrincipal';
import { PaginaInicioSesion } from '../modules/auth/presentation/LoginPage';
import { RedireccionUsuario } from '../modules/auth/presentation/RedireccionUsuario';
import { RutaPorEstado } from '../modules/auth/presentation/RutaPorEstado';
import { RutaProtegida } from '../modules/auth/presentation/RutaProtegida';
import { RutaConPermiso } from '../modules/auth/presentation/RutaConPermiso';
import { ProveedorPermisos } from '../modules/auth/application/PermisosContext';
import { HomePage } from '../modules/home/presentation/HomePage';
import { SuspendidoPage } from '../modules/estadoUsuario/presentation/SuspendidoPage';
import { PendienteValidacionPage } from '../modules/perfilInstitucional/presentation/PendienteValidacionPage';
import { RechazadoValidacionPage } from '../modules/perfilInstitucional/presentation/RechazadoValidacionPage';
import { RegistroInstitucionalPage } from '../modules/perfilInstitucional/presentation/RegistroInstitucionalPage';
import { ConsultaRegistrosPage } from '../modules/consultarRegistro/presentation/ConsultaRegistrosPage';
import { ResumenPeriodosPage } from '../modules/consultarRegistro/presentation/ResumenPeriodosPage';
import { DetalleRegistroPage } from '../modules/consultarRegistro/presentation/DetalleRegistroPage';
import { RegistroVictimasPage } from '../modules/registroVictimas/presentation/RegistroVictimasPage';
import { DetalleGestionVictimaPage } from '../modules/registroVictimas/presentation/DetalleGestionVictimaPage';
import { AdministracionPage } from '../modules/administracion/presentation/AdministracionPage';
import { CONFIGURACION_APLICACION } from '../config/aplicacion.config';

const R = CONFIGURACION_APLICACION.rutas;

export function EnrutadorAplicacion() {
  return (
    <Routes>
      <Route path={R.inicioSesion} element={<PaginaInicioSesion />} />

      <Route
        element={
          <RutaProtegida>
            <ProveedorPermisos>
              <LayoutPrincipal />
            </ProveedorPermisos>
          </RutaProtegida>
        }
      >
        <Route
          path={R.home}
          element={
            <RutaPorEstado estadosPermitidos={['ACTIVO']}>
              <RutaConPermiso permiso="estadisticas.consultar">
                <HomePage />
              </RutaConPermiso>
            </RutaPorEstado>
          }
        />

        <Route
          path={R.resumenRegistros}
          element={
            <RutaPorEstado estadosPermitidos={['ACTIVO']}>
              <RutaConPermiso permiso="registros.resumen.consultar">
                <ResumenPeriodosPage />
              </RutaConPermiso>
            </RutaPorEstado>
          }
        />

        <Route
          path={R.consultaRegistros}
          element={
            <RutaPorEstado estadosPermitidos={['ACTIVO']}>
              <RutaConPermiso permiso="registros.consultar">
                <ConsultaRegistrosPage />
              </RutaConPermiso>
            </RutaPorEstado>
          }
        />

        <Route
          path={`${R.consultaRegistros}/:idRegistro`}
          element={
            <RutaPorEstado estadosPermitidos={['ACTIVO']}>
              <RutaConPermiso permiso="registros.detalle.consultar">
                <DetalleRegistroPage />
              </RutaConPermiso>
            </RutaPorEstado>
          }
        />

        <Route
          path={R.registroVictimas}
          element={
            <RutaPorEstado estadosPermitidos={['ACTIVO']}>
              <RutaConPermiso permiso="victimas.consultar">
                <RegistroVictimasPage />
              </RutaConPermiso>
            </RutaPorEstado>
          }
        />

        <Route
          path={R.administracionUsuarios}
          element={
            <RutaPorEstado estadosPermitidos={['ACTIVO']}>
              <RutaConPermiso permiso="usuarios.consultar">
                <AdministracionPage />
              </RutaConPermiso>
            </RutaPorEstado>
          }
        />

        <Route
          path={`${R.registroVictimas}/:idRegistro`}
          element={
            <RutaPorEstado estadosPermitidos={['ACTIVO']}>
              <RutaConPermiso permiso="registros.detalle.consultar">
              <DetalleGestionVictimaPage />
              </RutaConPermiso>
            </RutaPorEstado>
          }
        />

        <Route
          path={R.registroInstitucional}
          element={
            <RutaPorEstado estadosPermitidos={['PENDIENTE_REGISTRO', 'RECHAZADO']}>
              <RegistroInstitucionalPage />
            </RutaPorEstado>
          }
        />

        <Route
          path={R.pendienteValidacion}
          element={
            <RutaPorEstado estadosPermitidos={['PENDIENTE_VALIDACION']}>
              <PendienteValidacionPage />
            </RutaPorEstado>
          }
        />

        <Route
          path={R.rechazadoValidacion}
          element={
            <RutaPorEstado estadosPermitidos={['RECHAZADO']}>
              <RechazadoValidacionPage />
            </RutaPorEstado>
          }
        />

        <Route
          path={R.suspendido}
          element={
            <RutaPorEstado estadosPermitidos={['SUSPENDIDO']}>
              <SuspendidoPage />
            </RutaPorEstado>
          }
        />
      </Route>

      <Route path={R.inicio} element={<RedireccionUsuario />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
