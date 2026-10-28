from pydantic import BaseModel, Field, field_validator

class AprobacionUsuarioDTO(BaseModel):
    observaciones: str | None = Field(default=None, max_length=1000)

class RechazoUsuarioDTO(BaseModel):
    observaciones: str = Field(min_length=3, max_length=1000)

    @field_validator("observaciones")
    @classmethod
    def validar_observaciones(cls, valor: str) -> str:
        valor = valor.strip()
        if not valor:
            raise ValueError("Las observaciones del rechazo son obligatorias.")
        return valor
