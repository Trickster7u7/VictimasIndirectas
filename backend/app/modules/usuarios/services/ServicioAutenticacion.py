import httpx

from fastapi import HTTPException
from fastapi.responses import (
    RedirectResponse,
)
from tortoise.transactions import in_transaction

from app.modules.usuarios.dao.IdentidadLlaveMxDAO import (
    IdentidadLlaveMxDAO,
)
from app.modules.usuarios.dao.UsuarioDAO import (
    UsuarioDAO,
)
from app.modules.usuarios.dto.DatosUsuarioLlaveMxDTO import (
    DatosUsuarioLlaveMXDTO,
)
from app.modules.usuarios.models.UsuarioModel import (
    Usuario,
)
from app.modules.usuarios.providers.ProveedorLlaveMx import (
    ProveedorLlaveMX,
)
from app.modules.usuarios.services.ServicioEstadoAutenticacion import (
    ServicioEstadoAutenticacion,
)
from app.modules.usuarios.services.ServicioSesionUsuario import (
    ServicioSesionUsuario,
)
from app.core.configuracion import (
    configuracion,
)
import logging
logger = logging.getLogger(__name__)
class ServicioAutenticacion:

    @staticmethod
    async def iniciar_sesion_llave_mx():

        proveedor = ProveedorLlaveMX()

        servicio_estado = (
            ServicioEstadoAutenticacion()
        )

        state = proveedor.generar_state()

        state_firmado = (
            servicio_estado.firmar(
                state
            )
        )

        url_autenticacion = (
            proveedor
            .construir_url_autenticacion(
                state=state
            )
        )

        respuesta = RedirectResponse(
            url=url_autenticacion,
            status_code=302,
        )

        respuesta.set_cookie(
            key="llave_mx_estado",
            value=state_firmado,
            httponly=True,
            secure=configuracion.cookies_seguras,
            samesite="lax",
            max_age=300,
            path="/",
        )

        return respuesta

    @staticmethod
    async def procesar_retorno_llave_mx(
        code: str,
        state: str,
        llave_mx_estado: str | None,
    ):

        if llave_mx_estado is None:
            raise HTTPException(
                status_code=401,
                detail=(
                    "No se encontró la cookie temporal "
                    "de autenticación."
                ),
            )

        servicio_estado = (
            ServicioEstadoAutenticacion()
        )

        estado_valido = (
            servicio_estado.validar(
                valor_firmado=llave_mx_estado,
                state_recibido=state,
            )
        )

        if not estado_valido:
            raise HTTPException(
                status_code=401,
                detail=(
                    "El estado de autenticación "
                    "no es válido."
                ),
            )

        proveedor = ProveedorLlaveMX()

        try:

            access_token = (
                await proveedor.obtener_token(
                    code=code
                )
            )

            datos_usuario = (
                await proveedor
                .obtener_datos_usuario(
                    access_token=access_token
                )
            )

        except httpx.HTTPStatusError as error:

            logger.error(
                "Error de Llave MX | endpoint=%s | status=%s",
                error.request.url.path,
                error.response.status_code,
            )

            raise HTTPException(
                status_code=502,
                detail="Llave MX rechazó la solicitud.",
            ) from error

        except httpx.RequestError as error:

            raise HTTPException(
                status_code=503,
                detail=(
                    "No fue posible comunicarse "
                    "con Llave MX."
                ),
            ) from error

        except (ValueError, TypeError) as error:
            # Error de contrato del proveedor; no revelar tokens ni datos personales.
            raise HTTPException(
                status_code=502,
                detail="Llave MX devolvió una respuesta inválida.",
            ) from error

        usuario = await (
            ServicioAutenticacion
            .procesar_usuario_llave_mx(
                datos=datos_usuario
            )
        )

        token_sesion, _ = await (
            ServicioSesionUsuario.crear_sesion(
                usuario=usuario
            )
        )

        url_destino = (
            f"{configuracion.frontend_url_quas.rstrip('/')}/"
        )

        respuesta = RedirectResponse(
            url=url_destino,
            status_code=302,
        )

        respuesta.headers["Cache-Control"] = "no-store"
        respuesta.headers["Referrer-Policy"] = "no-referrer"

        # Eliminar la cookie temporal OAuth.
        respuesta.delete_cookie(
            key="llave_mx_estado",
            path="/",
            secure=configuracion.cookies_seguras,
            samesite="lax",
        )

        # Establecer la sesión de Víctimas Indirectas.

        respuesta.set_cookie(
            key="sesion_usuario",
            value=token_sesion,
            httponly=True,
            secure=configuracion.cookies_seguras,
            samesite="lax",
            max_age=ServicioSesionUsuario.DURACION_SESION_HORAS * 60 * 60,
            path="/",
        )

        return respuesta

    @staticmethod
    async def procesar_usuario_llave_mx(
        datos: DatosUsuarioLlaveMXDTO,
    ) -> Usuario:

        identidad = (
            await IdentidadLlaveMxDAO
            .buscar_por_id_usuario_llave_mx(
                datos.id_usuario
            )
        )

        if identidad is not None:

            return await (
                ServicioAutenticacion
                ._sincronizar_usuario_existente(
                    identidad=identidad,
                    datos=datos,
                )
            )

        return await (
            ServicioAutenticacion
            ._registrar_usuario_nuevo(
                datos=datos
            )
        )

    @staticmethod
    async def _registrar_usuario_nuevo(
        datos: DatosUsuarioLlaveMXDTO,
    ) -> Usuario:

        async with in_transaction() as conexion:

            usuario = await UsuarioDAO.crear(
                datos=datos,
                usando_bd=conexion,
            )

            await IdentidadLlaveMxDAO.crear(
                usuario=usuario,
                id_usuario_llave_mx=(
                    datos.id_usuario
                ),
                login=datos.login,
                usando_bd=conexion,
            )

        return usuario

    @staticmethod
    async def _sincronizar_usuario_existente(
        identidad,
        datos: DatosUsuarioLlaveMXDTO,
    ) -> Usuario:

        usuario = await identidad.usuario

        async with in_transaction() as conexion:

            usuario = await (
                UsuarioDAO
                .actualizar_datos_llave_mx(
                    usuario=usuario,
                    datos=datos,
                    usando_bd=conexion,
                )
            )

            await (
                IdentidadLlaveMxDAO
                .actualizar_login(
                    identidad=identidad,
                    login=datos.login,
                    usando_bd=conexion,
                )
            )

        return usuario

