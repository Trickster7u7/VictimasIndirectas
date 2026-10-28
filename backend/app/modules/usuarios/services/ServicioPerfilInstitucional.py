from fastapi import HTTPException

from tortoise.transactions import in_transaction

from app.modules.usuarios.dao.PerfilInstitucionalDAO import (
    PerfilInstitucionalDAO,
)
from app.modules.usuarios.dao.UsuarioDAO import (
    UsuarioDAO,
)
from app.modules.usuarios.dto.RegistroInstitucionalDTO import (
    CrearPerfilInstitucionalRequestDTO,
    CrearPerfilInstitucionalResponseDTO,
    ObtenerPerfilInstitucionalResponseDTO,
    PerfilInstitucionalDTO,
)
from app.modules.usuarios.models.UsuarioModel import (
    Usuario,
)
from app.modules.usuarios.models.catalogos.EstatusUsuarioModel import (
    EstadoUsuario,
)


class ServicioPerfilInstitucional:

    @staticmethod
    async def guardar_y_enviar_a_validacion(
        usuario: Usuario,
        datos: CrearPerfilInstitucionalRequestDTO,
    ) -> CrearPerfilInstitucionalResponseDTO:

        estados_permitidos = {
            EstadoUsuario.PENDIENTE_REGISTRO,
            EstadoUsuario.RECHAZADO,
        }

        if usuario.estado not in estados_permitidos:
            raise ValueError(
                "El usuario no puede modificar "
                "su perfil institucional "
                "en su estado actual."
            )

        async with in_transaction() as conexion:

            perfil = (
                await PerfilInstitucionalDAO
                .obtener_por_usuario_id(
                    id_usuario=usuario.id,
                    usando_bd=conexion,
                )
            )

            if perfil:
                perfil = (
                    await PerfilInstitucionalDAO
                    .actualizar(
                        perfil=perfil,
                        datos=datos,
                        usando_bd=conexion,
                    )
                )

            else:
                perfil = (
                    await PerfilInstitucionalDAO
                    .crear(
                        usuario=usuario,
                        datos=datos,
                        usando_bd=conexion,
                    )
                )

            await UsuarioDAO.actualizar_estado(
                usuario=usuario,
                estado=EstadoUsuario.PENDIENTE_VALIDACION,
                usando_bd=conexion,
            )

        perfil_dto = PerfilInstitucionalDTO(
            id=perfil.id,
            institucion=perfil.institucion,
            area=perfil.area,
            cargo=perfil.cargo,
            telefono_institucional=(
                perfil.telefono_institucional
            ),
            entidad_federativa=(
                perfil.entidad_federativa
            ),
            observaciones_validacion=(
                perfil.observaciones_validacion
            ),
            fecha_envio_validacion=(
                perfil.fecha_envio_validacion
            ),
            fecha_validacion=(
                perfil.fecha_validacion
            ),
        )

        return CrearPerfilInstitucionalResponseDTO(
            ok=True,
            mensaje=(
                "El perfil institucional fue "
                "enviado a validación."
            ),
            estado=EstadoUsuario.PENDIENTE_VALIDACION.value,
            perfil=perfil_dto,
        )

    @staticmethod
    async def obtener_perfil_institucional(
        usuario: Usuario,
    ) -> ObtenerPerfilInstitucionalResponseDTO:

        perfil = (
            await PerfilInstitucionalDAO
            .obtener_por_usuario_id(
                id_usuario=usuario.id
            )
        )

        if perfil is None:
            raise HTTPException(
                status_code=404,
                detail=(
                    "El usuario no cuenta con "
                    "un perfil institucional."
                ),
            )

        perfil_dto = PerfilInstitucionalDTO(
            id=perfil.id,
            institucion=perfil.institucion,
            area=perfil.area,
            cargo=perfil.cargo,
            telefono_institucional=(
                perfil.telefono_institucional
            ),
            entidad_federativa=(
                perfil.entidad_federativa
            ),
            observaciones_validacion=(
                perfil.observaciones_validacion
            ),
            fecha_envio_validacion=(
                perfil.fecha_envio_validacion
            ),
            fecha_validacion=(
                perfil.fecha_validacion
            ),
        )

        return ObtenerPerfilInstitucionalResponseDTO(
            ok=True,
            perfil=perfil_dto,
        )