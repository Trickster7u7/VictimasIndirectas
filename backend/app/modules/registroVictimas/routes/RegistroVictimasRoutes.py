from fastapi import APIRouter, Depends, Query, Response

from app.modules.registroVictimas.dto.CandidataRenapoDTO import (
    RespuestaCandidatasRenapoDTO,
)
from app.modules.registroVictimas.services.ServicioCandidatasRenapo import (
    ServicioCandidatasRenapo,
)
from app.modules.usuarios.dependencias.DependenciasPermisos import (
    exigir_permiso_en_rutas_existentes,
)


# El prefijo se aplica en main.py: ruta canónica y alias de compatibilidad.
router = APIRouter(tags=["Registro de víctimas"])


@router.get(
    "/candidatas-renapo",
    response_model=RespuestaCandidatasRenapoDTO,
    dependencies=[Depends(
        exigir_permiso_en_rutas_existentes("victimas.consultar")
    )],
    summary="Listar víctimas candidatas a revisión RENAPO",
)
async def consultar_candidatas_renapo(
    response: Response,
    pagina: int = Query(1, ge=1),
    limite: int = Query(10, ge=1, le=100),
    curp: str | None = None,
    nombre: str | None = None,
    edad: int | None = Query(None, ge=0),
    fecha_hechos: str | None = None,
    entidad: str | None = None,
    numero_carpeta: str | None = None,
    mes: int | None = Query(None, ge=1, le=12),
    anio: int | None = Query(None, ge=2000, le=2100),
):
    """Solo selecciona candidatas. No realiza consultas ni cruces con RENAPO."""
    response.headers["Cache-Control"] = "private, no-store"
    return await ServicioCandidatasRenapo.listar(
        pagina=pagina,
        limite=limite,
        curp=curp,
        nombre=nombre,
        edad=edad,
        fecha_hechos=fecha_hechos,
        entidad=entidad,
        numero_carpeta=numero_carpeta,
        mes=mes,
        anio=anio,
    )
