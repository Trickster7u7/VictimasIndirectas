from fastapi import APIRouter, Depends

from app.modules.estadisticas.dto.EstadisticasVictimasDTO import (
    EstadisticasVictimasDTO,
)
from app.modules.estadisticas.services.ServicioEstadisticasVictimas import (
    ServicioEstadisticasVictimas,
)
from app.modules.usuarios.dependencias.DependenciasPermisos import (
    exigir_permiso,
    exigir_permiso_en_rutas_existentes,
)
from app.modules.estadisticas.dto.ResumenPeriodosDTO import ResumenPeriodoDTO


router = APIRouter(
    prefix="/api/estadisticas",
    tags=["Estadísticas"],
    dependencies=[Depends(
        exigir_permiso_en_rutas_existentes("estadisticas.consultar")
    )],
)


@router.get(
    "/victimas",
    response_model=EstadisticasVictimasDTO,
    summary="Indicadores agregados para el Home de Víctimas Indirectas",
)
async def consultar_estadisticas_victimas() -> EstadisticasVictimasDTO:
    return await ServicioEstadisticasVictimas.consultar_resumen()


@router.get(
    "/registros-por-periodo",
    response_model=list[ResumenPeriodoDTO],
    dependencies=[Depends(exigir_permiso("registros.resumen.consultar"))],
    summary="Tabla agregada por mes y año, sin datos de identificación",
)
async def consultar_tabla_resumen_periodos() -> list[ResumenPeriodoDTO]:
    return await ServicioEstadisticasVictimas.consultar_registros_por_periodo()
