from pydantic import BaseModel
from app.modules.usuarios.models.catalogos.EstatusUsuarioModel import (EstadoUsuario)


class UsuarioSesionDTO(BaseModel):
    id: int
    nombre: str
    primer_apellido: str
    segundo_apellido: str | None
    correo: str | None
    estado: EstadoUsuario


class SesionUsuarioResponseDTO(BaseModel):
    autenticado: bool
    usuario: UsuarioSesionDTO