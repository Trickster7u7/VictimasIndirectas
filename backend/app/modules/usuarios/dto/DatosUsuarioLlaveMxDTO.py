from datetime import date, datetime
from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)

class DatosUsuarioLlaveMXDTO(BaseModel):
    id_usuario: int = Field(alias="idUsuario")
    login: str
    nombre: str
    primer_apellido: str = Field(alias="primerApellido")
    segundo_apellido: str | None = Field(default=None, alias="segundoApellido")
    telefono: str | None = Field(default=None, alias="telVigente")
    correo: str | None = None
    curp: str | None = None
    fecha_nacimiento: date | None = Field(default=None, alias="fechaNacimiento")
    sexo: str | None = None
    model_config = ConfigDict(populate_by_name=True,extra="ignore")

    @field_validator("fecha_nacimiento",mode="before")
    
    @classmethod
    def convertir_fecha_nacimiento(cls,valor):
        if valor in (
            None,
            "",
            "null",
            "NULL",
        ):
            return None

        if isinstance(valor, date):
            return valor

        try:
            return datetime.strptime(
                valor,
                "%d/%m/%Y",
            ).date()

        except (ValueError, TypeError) as error:
            raise ValueError(
                "fechaNacimiento debe tener "
                "formato DD/MM/AAAA."
            ) from error