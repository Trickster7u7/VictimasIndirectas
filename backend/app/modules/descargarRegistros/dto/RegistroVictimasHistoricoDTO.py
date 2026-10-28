
from datetime import datetime
from pydantic import BaseModel, Field

class RegistroHistoricoDTO(BaseModel):
    id_registro: int
    mes: int
    anio: int
    origen: str
    estado_descarga: str
    verificado_api: bool
    fecha_descarga: datetime | None = None

    curp: str | None = None
    nombre_completo: str
    edad: int | None = None
    fecha_hechos: str | None = None
    entidad_hechos: str | None = None
    numero_carpeta: str | None = None


class RespuestaHistoricoDTO(BaseModel):
    pagina: int = Field(ge=1)
    limite: int = Field(ge=1)
    total: int = Field(ge=0)
    paginas: int = Field(ge=0)
    registros: list[RegistroHistoricoDTO]

class RegistroVictimaDetalleDTO(BaseModel):
    id_registro: int
    mes: int
    anio: int
    origen: str
    campos: dict[str, str | int | None]
