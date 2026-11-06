import secrets
from urllib.parse import urlencode
import httpx
from pydantic import ValidationError
from app.core.configuracion import configuracion
from app.modules.usuarios.dto.DatosUsuarioLlaveMxDTO import (DatosUsuarioLlaveMXDTO)
from datetime import UTC, datetime

class ProveedorLlaveMX:

    def generar_state(self) -> str:
        return secrets.token_urlsafe(64)

    def construir_url_autenticacion(self, state: str) -> str:
        parametros = {
            "client_id": configuracion.llave_client_id,
            "redirect_url": configuracion.llave_redirect_uri,
            "state": state,
        }

        return (
            f"{configuracion.llave_auth_url}"
            f"?{urlencode(parametros)}"
        )

    async def obtener_token(
        self,
        code: str,
    ) -> tuple[str, datetime]:

        cuerpo = {
            "grantType": "authorization_code",
            "code": code,
            "redirectUri": configuracion.llave_redirect_uri,
            "clientId": configuracion.llave_client_id,
            "clientSecret": configuracion.llave_client_secret,
        }

        url_token = (
            f"{configuracion.llave_api_url.rstrip('/')}"
            "/oauth/obtenerToken"
        )

        timeout = httpx.Timeout(
            connect=10.0,
            read=30.0,
            write=10.0,
            pool=10.0,
        )

        async with httpx.AsyncClient(
            timeout=timeout,
        ) as cliente:

            respuesta = await cliente.post(
                url_token,
                json=cuerpo,
                auth=(
                    configuracion.llave_basic_user,
                    configuracion.llave_basic_password,
                ),
                headers={
                    "Content-Type": "application/json",
                },
            )

            respuesta.raise_for_status()

            datos = respuesta.json()

            if not isinstance(datos, dict):
                raise ValueError(
                    "Llave MX devolvió una respuesta inválida."
                )

            access_token = datos.get("accessToken")
            expires_in = datos.get("expiresIn")

            if not isinstance(access_token, str) or not access_token:
                raise ValueError(
                    "Llave MX no devolvió un accessToken válido."
                )

            if (
                isinstance(expires_in, bool)
                or not isinstance(expires_in, (int, float))
            ):
                raise ValueError(
                    "Llave MX no devolvió una expiración válida."
                )

            try:
                fecha_expiracion = datetime.fromtimestamp(
                    expires_in / 1000,
                    tz=UTC,
                )
            except (ValueError, OverflowError, OSError) as error:
                raise ValueError(
                    "La fecha de expiración de Llave MX es inválida."
                ) from error

            if fecha_expiracion <= datetime.now(UTC):
                raise ValueError(
                    "Llave MX devolvió un token expirado."
                )

            return access_token, fecha_expiracion
    
    async def obtener_datos_usuario(self, access_token: str) -> DatosUsuarioLlaveMXDTO:
        url_datos_usuario = (
            f"{configuracion.llave_api_url.rstrip('/')}"
            "/oauth/datosUsuario"
        )

        encabezados = {
            "accessToken": access_token,
        }

        timeout = httpx.Timeout(
            connect=10.0,
            read=30.0,
            write=10.0,
            pool=10.0,
        )

        async with httpx.AsyncClient(
            timeout=timeout,
        ) as cliente:

            respuesta = await cliente.get(
                url_datos_usuario,
                headers=encabezados,
                auth=(
                    configuracion.llave_basic_user,
                    configuracion.llave_basic_password,
                ),
            )

            respuesta.raise_for_status()
            contenido = respuesta.json()

            if not isinstance(
                contenido,
                dict,
            ):
                raise ValueError(
                    "Llave MX devolvió una respuesta "
                    "con un formato inesperado."
                )

            try:
                return (
                    DatosUsuarioLlaveMXDTO
                    .model_validate(contenido)
                )

            except ValidationError as error:
                raise ValueError(
                    "Los datos devueltos por Llave MX "
                    "no cumplen el formato esperado: "
                    f"{error.errors(include_input=False)}"
                ) from error
                
    async def cerrar_sesion(
        self,
        access_token: str,
    ) -> bool:

        url_cierre = (
            f"{configuracion.llave_api_url.rstrip('/')}"
            "/oauth/cerrarSesion"
        )

        timeout = httpx.Timeout(
            connect=10.0,
            read=15.0,
            write=10.0,
            pool=10.0,
        )

        async with httpx.AsyncClient(
            timeout=timeout,
        ) as cliente:

            respuesta = await cliente.post(
                url_cierre,
                json={},
                headers={
                    "Content-Type": "application/json",
                    "accessToken": access_token,
                },
                auth=(
                    configuracion.llave_basic_user,
                    configuracion.llave_basic_password,
                ),
            )

            respuesta.raise_for_status()
            try:
                datos = respuesta.json()
            except ValueError as error:
                raise ValueError(
                    "Llave MX devolvió una respuesta de cierre inválida."
                ) from error

            if not isinstance(datos, dict):
                raise ValueError(
                    "La respuesta de cierre de Llave MX no es un objeto."
                )

            return datos.get("codeResponse") == 101