from datetime import datetime
from pydantic import BaseModel, Field


class CrearPerfilInstitucionalRequestDTO(BaseModel):
    institucion: str = Field(min_length=2, max_length=200, description="Institución a la que pertenece el usuario")
    area: str | None = Field(default=None, max_length=200, description="Área administrativa")
    cargo: str | None = Field(default=None, max_length=200, description="Cargo del usuario")
    telefono_institucional: str | None = Field(default=None, max_length=20, description="Teléfono institucional")
    entidad_federativa: str | None = Field(default=None, max_length=100, description="Entidad federativa")

class PerfilInstitucionalDTO(BaseModel):
    id: int
    institucion: str
    area: str | None
    cargo: str | None
    telefono_institucional: str | None
    entidad_federativa: str | None
    observaciones_validacion: str | None
    fecha_envio_validacion: datetime | None
    fecha_validacion: datetime | None


class CrearPerfilInstitucionalResponseDTO(BaseModel):
    ok: bool
    mensaje: str
    estado: str
    perfil: PerfilInstitucionalDTO
    
class ObtenerPerfilInstitucionalResponseDTO(BaseModel):
    ok: bool
    perfil: PerfilInstitucionalDTO
    