
from pydantic import BaseModel
from typing import Literal


class RegistroResumenDTO(BaseModel):
    id_registro: str
    curp: str | None = None
    nombre_completo: str
    fecha_hechos: str | None = None
    numero_nna_relacionados: int | None = None
    entidad_hechos: str | None = None
    numero_carpeta: str | None = None
    
    edad: int | None = None
    estado_consulta_nna: Literal[
        "pendiente",
        "Sin NNA",
        "error"
    ] = "pendiente"
