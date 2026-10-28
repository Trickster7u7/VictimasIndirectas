from fastapi import APIRouter, Depends

from app.modules.usuarios.dependencias.DependenciasAutenticacion import (
    obtener_usuario_actual,
    obtener_usuario_en_registro,
)
from app.modules.usuarios.models.UsuarioModel import Usuario
from app.modules.usuarios.services.ServicioPerfilInstitucional import ServicioPerfilInstitucional
from app.modules.usuarios.dto.RegistroInstitucionalDTO import (
    CrearPerfilInstitucionalRequestDTO,
    CrearPerfilInstitucionalResponseDTO,
    ObtenerPerfilInstitucionalResponseDTO,
)

router = APIRouter(
    prefix="/api/usuarios/perfil-institucional",
    tags=["Perfil institucional"],
)


@router.post("", response_model=CrearPerfilInstitucionalResponseDTO)
async def crear_perfil_institucional(
    datos: CrearPerfilInstitucionalRequestDTO,
    usuario: Usuario = Depends(obtener_usuario_en_registro),
):
    return await ServicioPerfilInstitucional.guardar_y_enviar_a_validacion(
        usuario=usuario,
        datos=datos,
    )


@router.get(
    "",
    response_model=ObtenerPerfilInstitucionalResponseDTO,
    summary="Consultar perfil institucional",
)
async def obtener_perfil_institucional(usuario: Usuario = Depends(obtener_usuario_actual)):
    return await ServicioPerfilInstitucional.obtener_perfil_institucional(
        usuario=usuario,
    )
