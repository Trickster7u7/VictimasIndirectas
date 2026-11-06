
from cryptography.fernet import Fernet, InvalidToken

from app.core.configuracion import configuracion


class ServicioCifradoTokens:
    """Cifrado de tokens externos utilizados por el backend."""

    @staticmethod
    def _obtener_cifrador() -> Fernet:
        clave = configuracion.llave_mx_clave_cifrado

        if clave is None:
            raise RuntimeError(
                "No está configurada la clave de cifrado "
                "de tokens de Llave MX."
            )

        return Fernet(
            clave.get_secret_value().encode("utf-8")
        )

    @staticmethod
    def cifrar_token(token: str) -> str:
        if not token:
            raise ValueError("El token no puede estar vacío.")

        cifrador = ServicioCifradoTokens._obtener_cifrador()

        token_cifrado = cifrador.encrypt(
            token.encode("utf-8")
        )

        return token_cifrado.decode("utf-8")

    @staticmethod
    def descifrar_token(token_cifrado: str) -> str:
        if not token_cifrado:
            raise ValueError("No existe un token cifrado.")

        cifrador = ServicioCifradoTokens._obtener_cifrador()

        try:
            token_original = cifrador.decrypt(
                token_cifrado.encode("utf-8")
            )

        except InvalidToken as error:
            raise ValueError(
                "No fue posible validar o descifrar el token."
            ) from error

        return token_original.decode("utf-8")
