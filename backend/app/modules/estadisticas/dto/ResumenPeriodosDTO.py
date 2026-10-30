"""Vista de tabla agregada para el rol CONSULTA, sin datos individuales."""

from pydantic import BaseModel, Field


class ResumenPeriodoDTO(BaseModel):
    anio: int = Field(ge=2000)
    mes: int = Field(ge=1, le=12)
    total_registros: int = Field(ge=0)
