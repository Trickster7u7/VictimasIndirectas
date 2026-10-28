from datetime import (UTC,datetime)
from app.modules.usuarios.dto.RegistroInstitucionalDTO import (CrearPerfilInstitucionalRequestDTO)
from app.modules.usuarios.models.PerfilInstitucionalModel import (PerfilInstitucional)
from app.modules.usuarios.models.UsuarioModel import (Usuario)

class PerfilInstitucionalDAO:

    @staticmethod
    async def obtener_por_usuario_id(
        id_usuario: int,
        usando_bd=None,
    ) -> PerfilInstitucional | None:

        consulta = PerfilInstitucional.filter(
            usuario_id=id_usuario
        )
        if usando_bd is not None:
            consulta = consulta.using_db(
                usando_bd
            )
        return await consulta.first()

    @staticmethod
    async def crear(
        usuario: Usuario,
        datos: CrearPerfilInstitucionalRequestDTO,
        usando_bd=None,
    ) -> PerfilInstitucional:

        return await PerfilInstitucional.create(
            usuario=usuario,
            institucion=datos.institucion,
            area=datos.area,
            cargo=datos.cargo,
            telefono_institucional=(
                datos.telefono_institucional
            ),
            entidad_federativa=(
                datos.entidad_federativa
            ),
            fecha_envio_validacion=(
                datetime.now(UTC)
            ),
            using_db=usando_bd,
        )

    @staticmethod
    async def actualizar(
        perfil: PerfilInstitucional,
        datos: CrearPerfilInstitucionalRequestDTO,
        usando_bd=None,
    ) -> PerfilInstitucional:

        perfil.institucion = datos.institucion
        perfil.area = datos.area
        perfil.cargo = datos.cargo
        perfil.telefono_institucional = (
            datos.telefono_institucional
        )
        perfil.entidad_federativa = (
            datos.entidad_federativa
        )
        perfil.fecha_envio_validacion = (
            datetime.now(UTC)
        )
        perfil.observaciones_validacion = None
        perfil.fecha_validacion = None
        perfil.usuario_validador = None

        await perfil.save(
            using_db=usando_bd
        )

        return perfil

@staticmethod
async def obtener_por_usuario_id(
    id_usuario: int,
    usando_bd=None,
) -> PerfilInstitucional | None:

    consulta = PerfilInstitucional.filter(
        usuario_id=id_usuario
    )

    if usando_bd is not None:
        consulta = consulta.using_db(
            usando_bd
        )

    return await consulta.first()

