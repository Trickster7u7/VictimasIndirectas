from fastapi import APIRouter, Cookie, Depends

from app.modules.usuarios.dependencias.DependenciasAutenticacion import (
    obtener_usuario_actual,
)
from app.modules.usuarios.dto.SesionUsuarioDTO import SesionUsuarioResponseDTO
from app.modules.usuarios.models.UsuarioModel import Usuario
from app.modules.usuarios.services.ServicioSesionUsuario import ServicioSesionUsuario

router = APIRouter(
    prefix="/api/autenticacion",
    tags=["Sesión"],
)

@router.get("/sesion", response_model=SesionUsuarioResponseDTO)
async def obtener_sesion(usuario: Usuario = Depends(obtener_usuario_actual)):
    return await ServicioSesionUsuario.obtener_sesion_actual(usuario=usuario)


@router.post("/cerrar-sesion", status_code=204)
async def cerrar_sesion(sesion_usuario: str | None = Cookie(default=None)):
    return await ServicioSesionUsuario.cerrar_sesion_http(token=sesion_usuario)
