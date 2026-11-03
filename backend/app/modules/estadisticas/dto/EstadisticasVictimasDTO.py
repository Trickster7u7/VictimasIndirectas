from datetime import datetime

from pydantic import BaseModel, Field


class EstadisticasVictimasDTO(BaseModel):
    total_victimas: int = Field(ge=0)
    victimas_menores_18: int = Field(ge=0)
    registros_curp_invalida: int = Field(ge=0)

    periodo_inicio: str | None = None
    periodo_fin: str | None = None

    fecha_consulta: datetime