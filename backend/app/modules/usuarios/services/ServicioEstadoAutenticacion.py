from itsdangerous import (
    BadSignature,
    SignatureExpired,
    URLSafeTimedSerializer,
)

from app.core.configuracion import configuracion


class ServicioEstadoAutenticacion:

    def __init__(self):
        self.serializador = URLSafeTimedSerializer(
            configuracion.secreto_sesion
        )

    def firmar(
        self,
        state: str,
    ) -> str:
        return self.serializador.dumps(
            {
                "state": state,
            }
        )

    def validar(
        self,
        valor_firmado: str,
        state_recibido: str,
        max_age: int = 300,
    ) -> bool:
        try:
            datos = self.serializador.loads(
                valor_firmado,
                max_age=max_age,
            )

        except (
            BadSignature,
            SignatureExpired,
        ):
            return False

        return datos.get("state") == state_recibido