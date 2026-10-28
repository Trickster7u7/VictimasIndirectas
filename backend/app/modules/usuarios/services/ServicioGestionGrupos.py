from tortoise.transactions import in_transaction

from app.modules.usuarios.dto.AccesosDTO import (
    GrupoDTO,
    GruposUsuarioDTO,
    RolDTO,
    RolesGrupoDTO,
)
from app.modules.usuarios.models.AuditoriaGruposModel import AuditoriaGrupos
from app.modules.usuarios.models.GrupoModel import Grupo
from app.modules.usuarios.models.GrupoRolModel import GrupoRol
from app.modules.usuarios.models.RolModel import Rol
from app.modules.usuarios.models.UsuarioGrupoModel import UsuarioGrupo
from app.modules.usuarios.models.UsuarioModel import Usuario


class ServicioGestionGrupos:
    @staticmethod
    async def listar_grupos() -> list[Grupo]:
        return await Grupo.all().order_by("nombre")

    @staticmethod
    async def crear_grupo(
        codigo: str, nombre: str, descripcion: str | None, usuario_actor: Usuario
    ) -> Grupo:
        nombre = nombre.strip()
        if len(nombre) < 3:
            raise ValueError("El nombre del grupo es demasiado corto.")
        async with in_transaction() as conexion:
            grupo = await Grupo.create(
                codigo=codigo, nombre=nombre,
                descripcion=descripcion, using_db=conexion,
            )
            await AuditoriaGrupos.create(
                actor_id=usuario_actor.id,
                grupo_id=grupo.id,
                usuario_id=None,
                tipo_cambio="CREAR_GRUPO",
                ids_anteriores=[],
                ids_nuevos=[],
                using_db=conexion,
            )
        return grupo

    @staticmethod
    async def obtener_grupos_usuario(id_usuario: int) -> GruposUsuarioDTO:
        if not await Usuario.filter(id=id_usuario).exists():
            raise LookupError("El usuario no existe.")
        ids_grupos = await UsuarioGrupo.filter(
            usuario_id=id_usuario
        ).values_list("grupo_id", flat=True)
        grupos = await Grupo.filter(id__in=ids_grupos).order_by("nombre")
        return GruposUsuarioDTO(
            id_usuario=id_usuario,
            grupos=[GrupoDTO.model_validate(grupo) for grupo in grupos],
        )

    @staticmethod
    async def obtener_roles_grupo(id_grupo: int) -> RolesGrupoDTO:
        if not await Grupo.filter(id=id_grupo).exists():
            raise LookupError("El grupo no existe.")
        ids_roles = await GrupoRol.filter(
            grupo_id=id_grupo
        ).values_list("rol_id", flat=True)
        roles = await Rol.filter(id__in=ids_roles).order_by("nombre")
        return RolesGrupoDTO(
            id_grupo=id_grupo,
            roles=[RolDTO.model_validate(rol) for rol in roles],
        )

    @staticmethod
    def _validar_ids(ids: list[int], etiqueta: str) -> None:
        if any(id_elemento <= 0 for id_elemento in ids):
            raise ValueError(f"Los IDs de {etiqueta} deben ser positivos.")
        if len(set(ids)) != len(ids):
            raise ValueError(f"La solicitud contiene {etiqueta} duplicados.")

    @staticmethod
    async def asignar_grupos_usuario(
        id_usuario: int, ids_grupos: list[int], usuario_actor: Usuario
    ) -> GruposUsuarioDTO:
        if id_usuario == usuario_actor.id:
            raise ValueError("No puedes modificar tus propios grupos.")
        ServicioGestionGrupos._validar_ids(ids_grupos, "grupos")

        async with in_transaction() as conexion:
            usuario = await Usuario.filter(id=id_usuario).using_db(
                conexion
            ).select_for_update().first()
            if usuario is None:
                raise LookupError("El usuario no existe.")

            ids_validos = await Grupo.filter(
                id__in=ids_grupos, activo=True
            ).using_db(conexion).values_list("id", flat=True)
            if set(ids_validos) != set(ids_grupos):
                raise ValueError("Uno o más grupos no existen o están inactivos.")

            anteriores = list(await UsuarioGrupo.filter(
                usuario_id=id_usuario
            ).using_db(conexion).values_list("grupo_id", flat=True))
            if set(anteriores) != set(ids_grupos):
                await UsuarioGrupo.filter(usuario_id=id_usuario).using_db(
                    conexion
                ).delete()
                for id_grupo in ids_grupos:
                    await UsuarioGrupo.create(
                        usuario_id=id_usuario,
                        grupo_id=id_grupo,
                        asignado_por_id=usuario_actor.id,
                        using_db=conexion,
                    )
                await AuditoriaGrupos.create(
                    actor_id=usuario_actor.id,
                    usuario_id=id_usuario,
                    grupo_id=None,
                    tipo_cambio="MEMBRESIA_USUARIO",
                    ids_anteriores=sorted(anteriores),
                    ids_nuevos=sorted(ids_grupos),
                    using_db=conexion,
                )

        return await ServicioGestionGrupos.obtener_grupos_usuario(id_usuario)

    @staticmethod
    async def asignar_roles_grupo(
        id_grupo: int, ids_roles: list[int], usuario_actor: Usuario
    ) -> RolesGrupoDTO:
        ServicioGestionGrupos._validar_ids(ids_roles, "roles")

        async with in_transaction() as conexion:
            grupo = await Grupo.filter(id=id_grupo).using_db(
                conexion
            ).select_for_update().first()
            if grupo is None:
                raise LookupError("El grupo no existe.")
            if not grupo.activo:
                raise ValueError("No puedes modificar los roles de un grupo inactivo.")

            # El rol ADMINISTRADOR concede privilegios de alcance global.
            # Solamente se permite asignarlo directamente a usuarios.
            validos = await Rol.filter(
                id__in=ids_roles, activo=True
            ).exclude(codigo="ADMINISTRADOR").using_db(
                conexion
            ).values_list("id", flat=True)
            if set(validos) != set(ids_roles):
                raise ValueError(
                    "Rol inexistente/inactivo o rol ADMINISTRADOR no permitido en grupos."
                )

            anteriores = list(await GrupoRol.filter(
                grupo_id=id_grupo
            ).using_db(conexion).values_list("rol_id", flat=True))
            if set(anteriores) != set(ids_roles):
                await GrupoRol.filter(grupo_id=id_grupo).using_db(
                    conexion
                ).delete()
                for id_rol in ids_roles:
                    await GrupoRol.create(
                        grupo_id=id_grupo, rol_id=id_rol, using_db=conexion
                    )
                await AuditoriaGrupos.create(
                    actor_id=usuario_actor.id,
                    usuario_id=None,
                    grupo_id=id_grupo,
                    tipo_cambio="ROLES_GRUPO",
                    ids_anteriores=sorted(anteriores),
                    ids_nuevos=sorted(ids_roles),
                    using_db=conexion,
                )

        return await ServicioGestionGrupos.obtener_roles_grupo(id_grupo)
