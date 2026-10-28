# Frontend - integración Llave MX

Frontend React + TypeScript + Vite conectado al backend FastAPI.

## Requisitos

- Node.js
- pnpm
- Backend ejecutándose en `http://localhost:8000`

## Instalación

```powershell
pnpm install
pnpm dev
```

El frontend se ejecuta por defecto en `http://localhost:5173`.

## Configuración

`.env`:

```env
VITE_API_URL=http://localhost:8000
```

## Flujo de usuario

- `PENDIENTE_REGISTRO` -> `/registro-institucional`
- `PENDIENTE_VALIDACION` -> `/validacion/pendiente`
- `RECHAZADO` -> `/validacion/rechazado`
- `ACTIVO` -> `/home`
- `SUSPENDIDO` -> `/suspendido`

El backend debe redirigir el callback de Llave MX a `http://localhost:5173/` después de crear la cookie `sesion_usuario`. El frontend consulta `/api/autenticacion/sesion` y decide la ruta según `usuario.estado`.

## Endpoints utilizados

- `GET /api/autenticacion/llave-mx/iniciar`
- `GET /api/autenticacion/sesion`
- `POST /api/autenticacion/cerrar-sesion`
- `GET /api/usuarios/perfil-institucional`
- `POST /api/usuarios/perfil-institucional`
