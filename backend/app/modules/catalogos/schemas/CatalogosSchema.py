from pydantic import BaseModel, Field


class EntidadRespuesta(BaseModel):
    id: int
    clave: str = Field(
        description="Clave oficial de INEGI",
        examples=["15"]
    )
    nombre: str = Field(
        description="Nombre de la entidad federativa",
        examples=["México"]
    )