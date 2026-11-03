from fastapi import APIRouter

from app.modules.catalogos.schemas.CatalogosSchema import (
    EntidadRespuesta,
)
from app.modules.catalogos.services.CatalogosService import (
    CatalogosService,
)

router = APIRouter(
    prefix="/api/catalogos",
    tags=["Catálogos"],
)


@router.get(
    "/entidades",
    response_model=list[EntidadRespuesta],
    summary="Consultar entidades federativas",
    description="Obtiene las entidades federativas activas.",
)
async def obtener_entidades():

    return await CatalogosService.listar_entidades()