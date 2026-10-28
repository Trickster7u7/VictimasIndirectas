import { Navigate, Route, Routes } from 'react-router-dom';

import { LayoutPrincipal } from '../components/estructura/LayoutPrincipal';
import { PaginaInicioSesion } from '../modules/auth/presentation/LoginPage';
import { RedireccionUsuario } from '../modules/auth/presentation/RedireccionUsuario';
import { RutaPorEstado } from '../modules/auth/presentation/RutaPorEstado';
import { RutaProtegida } from '../modules/auth/presentation/RutaProtegida';
import { HomePage } from '../modules/home/presentation/HomePage';
import { SuspendidoPage } from '../modules/estadoUsuario/presentation/SuspendidoPage';
import { PendienteValidacionPage } from '../modules/perfilInstitucional/presentation/PendienteValidacionPage';
import { RechazadoValidacionPage } from '../modules/perfilInstitucional/presentation/RechazadoValidacionPage';
import { RegistroInstitucionalPage } from '../modules/perfilInstitucional/presentation/RegistroInstitucionalPage';
import { ConsultaRegistrosPage } from '../modules/consultarRegistro/presentation/ConsultaRegistrosPage';
import { DetalleRegistroPage } from '../modules/consultarRegistro/presentation/DetalleRegistroPage';
import { RegistroVictimasPage } from '../modules/registroVictimas/presentation/RegistroVictimasPage';
import { CONFIGURACION_APLICACION } from '../config/aplicacion.config';

const R = CONFIGURACION_APLICACION.rutas;

export function EnrutadorAplicacion() {
  return (
    <Routes>
      <Route
        path={R.inicioSesion}
        element={<PaginaInicioSesion />}
      />

      <Route
        element={
          <RutaProtegida>
            <LayoutPrincipal />
          </RutaProtegida>
        }
      >
        <Route
          path={R.home}
          element={
            <RutaPorEstado estadosPermitidos={['ACTIVO']}>
              <HomePage />
            </RutaPorEstado>
          }
        />
        <Route
          path={R.consultaRegistros}
          element={<ConsultaRegistrosPage />}
        />

        <Route
          path={`${R.consultaRegistros}/:idRegistro`}
          element={<DetalleRegistroPage />}
        />

        <Route
          path={R.registroVictimas}
          element={<RegistroVictimasPage />}
        />

        <Route
          path={`${R.registroVictimas}/:idRegistro`}
          element={<DetalleRegistroPage />}
        />

        <Route
          path={R.registroInstitucional}
          element={
            <RutaPorEstado
              estadosPermitidos={[
                'PENDIENTE_REGISTRO',
                'RECHAZADO',
              ]}
            >
              <RegistroInstitucionalPage />
            </RutaPorEstado>
          }
        />

        <Route
          path={R.pendienteValidacion}
          element={
            <RutaPorEstado
              estadosPermitidos={['PENDIENTE_VALIDACION']}
            >
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

      <Route
        path={R.inicio}
        element={<RedireccionUsuario />}
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}
