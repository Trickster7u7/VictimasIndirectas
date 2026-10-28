from fastapi import (Cookie, Depends, HTTPException)
from app.modules.usuarios.models.UsuarioModel import (Usuario)
from app.modules.usuarios.models.catalogos.EstatusUsuarioModel import (EstadoUsuario)
from app.modules.usuarios.services.ServicioSesionUsuario import (ServicioSesionUsuario)


async def obtener_usuario_actual(
    sesion_usuario: str | None = Cookie(
        default=None
    ),
) -> Usuario:

    if sesion_usuario is None:
        raise HTTPException(
            status_code=401,
            detail="No existe una sesión activa.",
        )

    sesion = await (
        ServicioSesionUsuario
        .obtener_sesion_valida(
            token=sesion_usuario
        )
    )

    if sesion is None:
        raise HTTPException(
            status_code=401,
            detail=(
                "La sesión no es válida "
                "o ha expirado."
            ),
        )

    return sesion.usuario


async def obtener_usuario_en_registro(
    usuario: Usuario = Depends(
        obtener_usuario_actual
    ),
) -> Usuario:

    estados_permitidos = {
        EstadoUsuario.PENDIENTE_REGISTRO,
        EstadoUsuario.RECHAZADO,
    }

    if usuario.estado not in estados_permitidos:
        raise HTTPException(
            status_code=403,
            detail=(
                "El usuario no puede modificar "
                "su registro institucional."
            ),
        )

    return usuario


async def obtener_usuario_activo(
    usuario: Usuario = Depends(
        obtener_usuario_actual
    ),
) -> Usuario:

    if usuario.estado != EstadoUsuario.ACTIVO:
        raise HTTPException(
            status_code=403,
            detail=(
                "El usuario no tiene acceso "
                "a esta funcionalidad."
            ),
        )

    return usuario