import hashlib
import secrets

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
    async def crear_sesion(
        usuario: Usuario,
    ) -> tuple[str, SesionUsuario]:

        token = (
            ServicioSesionUsuario
            ._generar_token()
        )

        hash_token = (
            ServicioSesionUsuario
            ._generar_hash_token(
                token
            )
        )

        fecha_expiracion = (
            datetime.now(UTC)
            + timedelta(
                hours=(
                    ServicioSesionUsuario
                    .DURACION_SESION_HORAS
                )
            )
        )

        sesion = await SesionUsuarioDAO.crear(
            usuario=usuario,
            hash_token=hash_token,
            fecha_expiracion=fecha_expiracion,
        )

        return token, sesion

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
            return False

        await SesionUsuarioDAO.revocar(
            sesion=sesion,
            fecha_revocacion=datetime.now(UTC),
        )

        return True

    @staticmethod
    async def cerrar_sesion_http(
        token: str | None,
    ) -> Response:

        if token is not None:
            await (
                ServicioSesionUsuario
                .cerrar_sesion(
                    token=token
                )
            )

        respuesta = Response(
            status_code=204
        )

        respuesta.delete_cookie(
            key="sesion_usuario",
            path="/",
            secure=configuracion.cookies_seguras,
            httponly=True,
            samesite="lax",
        )

        return respuesta