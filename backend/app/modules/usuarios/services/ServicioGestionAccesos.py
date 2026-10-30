from tortoise.transactions import in_transaction

from app.modules.usuarios.dao.AccesosDAO import AccesosDAO
from app.modules.usuarios.dto.AccesosDTO import RolDTO, RolesUsuarioDTO
from app.modules.usuarios.models.AuditoriaRolesModel import AuditoriaRoles
from app.modules.usuarios.models.PermisoModel import Permiso
from app.modules.usuarios.models.RolModel import Rol
from app.modules.usuarios.models.UsuarioModel import Usuario
from app.modules.usuarios.models.UsuarioRolModel import UsuarioRol
from app.modules.usuarios.models.catalogos.EstatusUsuarioModel import EstadoUsuario


class ServicioGestionAccesos:
    @staticmethod
    async def listar_roles():
        # Los roles retirados se conservan en la BD por trazabilidad,
        # pero no deben ofrecerse para asignaciones nuevas.
        return await Rol.filter(activo=True).order_by("nombre")

    @staticmethod
    async def listar_permisos():
        return await Permiso.all().order_by("modulo", "codigo")

    @staticmethod
    async def obtener_roles_usuario(id_usuario: int) -> RolesUsuarioDTO:
        if not await Usuario.filter(id=id_usuario).exists():
            raise LookupError("El usuario no existe.")
        roles = await AccesosDAO.obtener_roles_usuario(id_usuario)
        return RolesUsuarioDTO(
            id_usuario=id_usuario,
            roles=[RolDTO.model_validate(rol, from_attributes=True) for rol in roles],
        )

    @staticmethod
    async def asignar_roles(
        id_usuario: int, ids_roles: list[int], usuario_actor: Usuario
    ) -> RolesUsuarioDTO:
        if id_usuario == usuario_actor.id:
            raise ValueError("No puedes modificar tus propios roles.")
        if any(id_rol <= 0 for id_rol in ids_roles):
            raise ValueError("Los identificadores de roles deben ser positivos.")
        if len(set(ids_roles)) != len(ids_roles):
            raise ValueError("Hay roles duplicados en la solicitud.")

        async with in_transaction() as conexion:
            # Bloqueo para serializar cambios simultáneos sobre el mismo usuario.
            usuario = await Usuario.filter(id=id_usuario).using_db(
                conexion
            ).select_for_update().first()
            if usuario is None:
                raise LookupError("El usuario no existe.")

            roles_validos = await Rol.filter(
                id__in=ids_roles, activo=True
            ).using_db(conexion).values_list("id", flat=True)
            if set(roles_validos) != set(ids_roles):
                raise ValueError("Uno o más roles no existen o están inactivos.")

            roles_anteriores = list(await UsuarioRol.filter(
                usuario_id=id_usuario
            ).using_db(conexion).values_list("rol_id", flat=True))

            # Bloquear la fila ADMINISTRADOR evita retirar simultáneamente
            # los roles de dos cuentas y dejar al sistema sin administrador.
            rol_administrador = await Rol.filter(
                codigo="ADMINISTRADOR"
            ).using_db(conexion).select_for_update().first()
            if (
                rol_administrador is not None
                and rol_administrador.id in roles_anteriores
                and rol_administrador.id not in ids_roles
                and usuario.estado == EstadoUsuario.ACTIVO
            ):
                administradores_activos = await UsuarioRol.filter(
                    rol_id=rol_administrador.id,
                    usuario__estado=EstadoUsuario.ACTIVO,
                ).using_db(conexion).count()
                if administradores_activos <= 1:
                    raise ValueError("No se puede retirar el último administrador activo.")

            if set(roles_anteriores) != set(ids_roles):
                await UsuarioRol.filter(usuario_id=id_usuario).using_db(
                    conexion
                ).delete()
                for id_rol in ids_roles:
                    await UsuarioRol.create(
                        usuario_id=id_usuario,
                        rol_id=id_rol,
                        asignado_por_id=usuario_actor.id,
                        using_db=conexion,
                    )

                await AuditoriaRoles.create(
                    actor_id=usuario_actor.id,
                    usuario_id=id_usuario,
                    roles_anteriores=sorted(roles_anteriores),
                    roles_nuevos=sorted(ids_roles),
                    using_db=conexion,
                )

        return await ServicioGestionAccesos.obtener_roles_usuario(id_usuario)
