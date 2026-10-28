
from fastapi import APIRouter, Depends, HTTPException, Query
import httpx

from app.modules.descargarRegistros.dto.PeriodoConsultaVictimasDTO import (
    PeriodoConsultaVictimasDTO,
)

from app.modules.descargarRegistros.dto.RegistroVictimasResumenDTO import (
    RegistroResumenDTO,
)

from app.modules.descargarRegistros.services.ServicioRegistrosVictimas import (
    ServicioRegistroVictimas,
)

from app.modules.usuarios.dependencias.DependenciasAutenticacion import (
    obtener_usuario_activo,
)

from app.modules.usuarios.models.UsuarioModel import (
    Usuario,
)
from app.modules.descargarRegistros.dto.RegistroVictimasHistoricoDTO import (
    RegistroVictimaDetalleDTO,
    RespuestaHistoricoDTO,
)
from app.modules.descargarRegistros.services.ServicioConsultaRegistrosVictimas import (
    ServicioConsultaRegistrosVictimas,
)

from app.modules.descargarRegistros.dependencias.DependenciasSincronizacionVictimas import (
    puede_sincronizar,
    obtener_usuario_sincronizador,
)

from app.modules.descargarRegistros.services.ServicioSincronizacionVictimas import (
    ServicioSincronizacionVictimas,
)

router = APIRouter(
    prefix="/api/registros-victimas",
    tags=["Descarga de registros"],
)


@router.get(
    "",
    response_model=list[RegistroResumenDTO],
    summary="Consultar víctimas por mes y año",
)
async def consultar_registros_victimas(
    mes: int = Query(..., ge=1, le=12),
    anio: int = Query(..., ge=2000, le=2100),
    usuario: Usuario = Depends(obtener_usuario_activo),
):
    periodo = PeriodoConsultaVictimasDTO(
        mes=mes,
        anio=anio,
    )

    registros = await (
        ServicioRegistroVictimas.consultar_por_periodo(
            periodo=periodo,
        )
    )

    return registros


@router.get(
    "/historico",
    response_model=RespuestaHistoricoDTO,
    dependencies=[Depends(obtener_usuario_activo)],
)
async def consultar_historico(
    pagina: int = Query(1, ge=1),
    limite: int = Query(10, ge=1, le=100),
    curp: str | None = None,
    nombre: str | None = None,
    fecha_hechos: str | None = None,
    edad: int | None = Query(None, ge=0),
    entidad: str | None = None,
    numero_carpeta: str | None = None,
    mes: int | None = Query(None, ge=1, le=12),
    anio: int | None = Query(None, ge=2000, le=2100),
):
    return await ServicioConsultaRegistrosVictimas.obtener_historico(
        pagina=pagina,
        limite=limite,
        curp=curp,
        nombre=nombre,
        fecha_hechos=fecha_hechos,
        edad=edad,
        entidad=entidad,
        numero_carpeta=numero_carpeta,
        mes=mes,
        anio=anio,
    )


@router.get(
    "/historico/{id_registro}",
    response_model=RegistroVictimaDetalleDTO,
    dependencies=[Depends(obtener_usuario_activo)],
)
async def consultar_detalle_registro(
    id_registro: int,
):
    detalle = await (
        ServicioConsultaRegistrosVictimas.obtener_detalle(
            id_registro
        )
    )

    if detalle is None:
        raise HTTPException(
            status_code=404,
            detail="Registro no encontrado",
        )

    return detalle

# ==========================================
# ESTADO DE SINCRONIZACIÓN SESNSP
# ==========================================

@router.get(
    "/sincronizacion/estado",
    summary="Checklist mensual de descargas SESNSP desde enero de 2026",
)
async def consultar_estado_sincronizacion(
    usuario: Usuario = Depends(obtener_usuario_activo),
):
    return await ServicioSincronizacionVictimas.obtener_estado_mensual(
        usuario_autorizado=puede_sincronizar(usuario),
    )

# ==========================================
# SINCRONIZACIÓN MANUAL DE VÍCTIMAS
# ==========================================

@router.post(
    "/sincronizacion",
    summary="Sincronizar víctimas desde SESNSP",
)
async def sincronizar_victimas(
    anio: int = Query(..., ge=2000, le=2100),
    mes: int = Query(..., ge=1, le=12),
    usuario: Usuario = Depends(
        obtener_usuario_sincronizador
    ),
):

    try:

        resultado = await (
            ServicioSincronizacionVictimas.sincronizar_periodo(
                anio=anio,
                mes=mes,
            )
        )

        return resultado

    except httpx.HTTPStatusError as error:

        raise HTTPException(
            status_code=502,
            detail=(
                "La API de SESNSP rechazó la solicitud. "
                f"Código: {error.response.status_code}"
            ),
        ) from error

    except httpx.RequestError as error:

        raise HTTPException(
            status_code=502,
            detail="No fue posible comunicarse con SESNSP.",
        ) from error

    except (ValueError, RuntimeError) as error:

        raise HTTPException(
            status_code=409,
            detail=str(error),
        ) from error


