from fastapi import APIRouter, Cookie, Query

from app.modules.usuarios.services.ServicioAutenticacion import ServicioAutenticacion

router = APIRouter(tags=["Autenticación"])


@router.get("/api/autenticacion/llave-mx/iniciar", summary="Iniciar sesión con Llave MX")
async def iniciar_sesion_llave_mx():
    return await ServicioAutenticacion.iniciar_sesion_llave_mx()


@router.get("/auth/callback", summary="Procesar retorno de Llave MX")
async def retorno_llave_mx(
    code: str = Query(...),
    state: str = Query(...),
    llave_mx_estado: str | None = Cookie(default=None),
):
    return await ServicioAutenticacion.procesar_retorno_llave_mx(
        code=code,
        state=state,
        llave_mx_estado=llave_mx_estado,
    )
