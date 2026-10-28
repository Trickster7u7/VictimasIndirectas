
from pydantic import BaseModel, Field


class PeriodoConsultaVictimasDTO(BaseModel):
    mes: int = Field(
        ge=1,
        le=12,
        description="Mes de consulta, del 1 al 12"
    )

    anio: int = Field(
        ge=2000,
        le=2100,
        description="Año de consulta"
    )
