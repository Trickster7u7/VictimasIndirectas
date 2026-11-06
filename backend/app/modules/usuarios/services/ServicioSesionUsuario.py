import hashlib
import secrets
import logging
import httpx
from datetime import (
    UTC,
    datetime,
    timedelta,
)

from starlette.responses import Response
from app.core.configuracion import configuracion

from app.modules.usuarios.dao.SesionUsuarioDAO import (
    SesionUsuarioDAO,
)
from app.modules.usuarios.dto.SesionUsuarioDTO import (
    SesionUsuarioResponseDTO,
    UsuarioSesionDTO,
)
from app.modules.usuarios.models.SesionUsuarioModel import (
    SesionUsuario,
)
from app.modules.usuarios.models.UsuarioModel import (
    Usuario,
)
from app.modules.usuarios.services.ServicioCifradoTokens import (
    ServicioCifradoTokens,
)

from app.modules.usuarios.providers.ProveedorLlaveMx import (
    ProveedorLlaveMX,
)
logger = logging.getLogger(__name__)

class ServicioSesionUsuario:

    DURACION_SESION_HORAS = 8

    @staticmethod
    def _generar_token() -> str:
        return secrets.token_urlsafe(64)

    @staticmethod
    def _generar_hash_token(
        token: str,
    ) -> str:
        return hashlib.sha256(
            token.encode("utf-8")
        ).hexdigest()

    @staticmethod
    async def obtener_sesion_valida(
        token: str,
    ) -> SesionUsuario | None:

        hash_token = (
            ServicioSesionUsuario
            ._generar_hash_token(
                token
            )
        )

        sesion = (
            await SesionUsuarioDAO
            .buscar_por_hash_token(
                hash_token=hash_token
            )
        )

        if sesion is None:
            return None

        if (
            sesion.fecha_expiracion
            <= datetime.now(UTC)
        ):
            return None

        return sesion

    @staticmethod
    async def obtener_sesion_actual(
        usuario: Usuario,
    ) -> SesionUsuarioResponseDTO:

        return SesionUsuarioResponseDTO(
            autenticado=True,
            usuario=UsuarioSesionDTO(
                id=usuario.id,
                nombre=usuario.nombre,
                primer_apellido=(
                    usuario.primer_apellido
                ),
                segundo_apellido=(
                    usuario.segundo_apellido
                ),
                correo=usuario.correo,
                estado=usuario.estado,
            ),
        )

    @staticmethod
    async def cerrar_sesion(
        token: str,
    ) -> bool:

        # 1. Identificar la sesión local
        hash_token = (
            ServicioSesionUsuario
            ._generar_hash_token(token)
        )

        sesion = await (
            SesionUsuarioDAO.buscar_por_hash_token(
                hash_token=hash_token
            )
        )

        if sesion is None:
            return False

        # 2. Recuperar el token de Llave MX
        token_cifrado = sesion.token_llave_mx_cifrado

        if token_cifrado:

            try:
                # Descifrar el access token
                access_token = (
                    ServicioCifradoTokens.descifrar_token(
                        token_cifrado
                    )
                )

                # Solicitar cierre de sesión a Llave MX
                proveedor = ProveedorLlaveMX()

                cierre_exitoso = await proveedor.cerrar_sesion(
                    access_token=access_token
                )

                if cierre_exitoso:
                    logger.info(
                        "Llave MX confirmó el cierre del token."
                    )
                else:
                    logger.warning(
                        "Llave MX no confirmó el cierre del token."
                    )

            except (
                httpx.HTTPError,
                ValueError,
                TypeError,
            ):
                logger.exception(
                    "No fue posible completar el cierre "
                    "de sesión en Llave MX."
                )

            except RuntimeError:
                logger.exception(
                    "Error de configuración al procesar "
                    "el token de Llave MX."
                )

        # 3. Revocar la sesión local aunque Llave MX falle
        await SesionUsuarioDAO.revocar(
            sesion=sesion,
            fecha_revocacion=datetime.now(UTC),
        )

        return True

    @staticmethod
    async def crear_sesion(
        usuario: Usuario,
        access_token_llave_mx: str | None = None,
        expiracion_llave_mx: datetime | None = None,
    ) -> tuple[str, SesionUsuario]:

        # 1. Validar que recibamos ambos datos o ninguno
        if (access_token_llave_mx is None) != (expiracion_llave_mx is None):
            raise ValueError(
                "El token de Llave MX y su expiración "
                "deben proporcionarse juntos."
            )

        if expiracion_llave_mx is not None:
            if (
                expiracion_llave_mx.tzinfo is None
                or expiracion_llave_mx <= datetime.now(UTC)
            ):
                raise ValueError(
                    "La expiración del token de Llave MX no es válida."
                )

        # 2. Generar token de nuestra sesión local
        token = ServicioSesionUsuario._generar_token()

        # 3. Generar su hash
        hash_token = ServicioSesionUsuario._generar_hash_token(
            token
        )

        # 4. Calcular expiración de nuestra sesión
        fecha_expiracion = (
            datetime.now(UTC)
            + timedelta(
                hours=ServicioSesionUsuario.DURACION_SESION_HORAS
            )
        )

        # 5. Cifrar el token de Llave MX si existe
        token_cifrado = None

        if access_token_llave_mx is not None:
            token_cifrado = ServicioCifradoTokens.cifrar_token(
                access_token_llave_mx
            )

        # 6. Guardar la sesión en PostgreSQL
        sesion = await SesionUsuarioDAO.crear(
            usuario=usuario,
            hash_token=hash_token,
            fecha_expiracion=fecha_expiracion,
            token_llave_mx_cifrado=token_cifrado,
            token_llave_mx_expiracion=expiracion_llave_mx,
        )

        return token, sesion

    @staticmethod
    async def cerrar_sesion_http(
        token: str | None,
    ) -> Response:

        # Revocar la sesión local
        if token is not None:
            await ServicioSesionUsuario.cerrar_sesion(
                token=token
            )

        # Crear respuesta HTTP
        respuesta = Response(
            status_code=204
        )

        # Eliminar cookie del navegador
        respuesta.delete_cookie(
            key="sesion_usuario",
            path="/",
            secure=configuracion.cookies_seguras,
            httponly=True,
            samesite="lax",
        )
        respuesta.headers["Cache-Control"] = "no-store"
        return respuesta