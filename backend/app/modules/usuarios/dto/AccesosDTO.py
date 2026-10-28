from pydantic import BaseModel, ConfigDict, Field


class RolDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    codigo: str
    nombre: str
    activo: bool


class PermisoDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    codigo: str
    nombre: str
    modulo: str


class GrupoDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    codigo: str
    nombre: str
    descripcion: str | None
    activo: bool


class CrearGrupoDTO(BaseModel):
    model_config = ConfigDict(extra="forbid")

    codigo: str = Field(min_length=3, max_length=50, pattern=r"^[A-Z][A-Z0-9_]*$")
    nombre: str = Field(min_length=3, max_length=120)
    descripcion: str | None = Field(default=None, max_length=1000)


class AsignarRolesDTO(BaseModel):
    # [] significa retirar todos los roles; nunca modifica el estado del usuario.
    ids_roles: list[int] = Field(..., max_length=20)


class RolesUsuarioDTO(BaseModel):
    id_usuario: int
    roles: list[RolDTO]


class AsignarGruposDTO(BaseModel):
    ids_grupos: list[int] = Field(..., max_length=30)


class GruposUsuarioDTO(BaseModel):
    id_usuario: int
    grupos: list[GrupoDTO]


class RolesGrupoDTO(BaseModel):
    id_grupo: int
    roles: list[RolDTO]
