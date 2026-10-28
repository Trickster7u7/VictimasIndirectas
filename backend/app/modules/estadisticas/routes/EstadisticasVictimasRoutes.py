from fastapi import APIRouter, Depends

from app.modules.estadisticas.dto.EstadisticasVictimasDTO import (
    EstadisticasVictimasDTO,
)
from app.modules.estadisticas.services.ServicioEstadisticasVictimas import (
    ServicioEstadisticasVictimas,
)
from app.modules.usuarios.dependencias.DependenciasAutenticacion import (
    obtener_usuario_activo,
)


router = APIRouter(
    prefix="/api/estadisticas",
    tags=["Estadísticas"],
    dependencies=[Depends(obtener_usuario_activo)],
)


@router.get(
    "/victimas",
    response_model=EstadisticasVictimasDTO,
    summary="Indicadores agregados para el Home de Víctimas Indirectas",
)
async def consultar_estadisticas_victimas() -> EstadisticasVictimasDTO:
    return await ServicioEstadisticasVictimas.consultar_resumen()
