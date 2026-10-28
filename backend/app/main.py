from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from urllib.parse import urlsplit

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from tortoise.contrib.fastapi import RegisterTortoise

from app.core.BaseDatos import CONFIGURACION_TORTOISE
from app.core.configuracion import configuracion
from app.modules.descargarRegistros.routes.RegistrosVictimasRoutes import (
    router as router_descarga_registros,
)
from app.modules.registroVictimas.routes.RegistroVictimasRoutes import (
    router as router_gestion_victimas,
)
from app.modules.estadisticas.routes.EstadisticasVictimasRoutes import (
    router as router_estadisticas_victimas,
)
from app.modules.usuarios.routes.AutenticacionRoutes import (
    router as router_autenticacion,
)
from app.modules.usuarios.routes.PerfilInstitucionalRoutes import (
    router as router_perfil_institucional,
)
from app.modules.usuarios.routes.SesionUsuarioRoutes import (
    router as router_sesion_usuario,
)
from app.modules.usuarios.routes.GestionAccesosRoutes import (
    router as router_gestion_accesos,
)




@asynccontextmanager
async def ciclo_vida(aplicacion: FastAPI) -> AsyncGenerator[None, None]:
    async with RegisterTortoise(
        aplicacion,
        config=CONFIGURACION_TORTOISE,
        generate_schemas=False,
    ):
        yield
aplicacion = FastAPI(
    title=configuracion.nombre_aplicacion,
    lifespan=ciclo_vida,
)



aplicacion.include_router(router_sesion_usuario)
aplicacion.include_router(router_autenticacion)
aplicacion.include_router(router_perfil_institucional)
aplicacion.include_router(router_descarga_registros)
aplicacion.include_router(router_gestion_victimas, prefix="/api/registro-victimas")
aplicacion.include_router(router_estadisticas_victimas)
aplicacion.include_router(router_gestion_accesos)

origenes_permitidos = [
    "https://dticap.dif.gob.mx",
    "http://localhost:5173",
]

aplicacion.add_middleware(
    CORSMiddleware,
    allow_origins=origenes_permitidos,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



