from tortoise.transactions import in_transaction

from app.modules.usuarios.dto.AccesosDTO import PermisosRolDTO
from app.modules.usuarios.models.AuditoriaPermisosRolModel import AuditoriaPermisosRol
from app.modules.usuarios.models.PermisoModel import Permiso
from app.modules.usuarios.models.RolModel import Rol
from app.modules.usuarios.models.RolPermisoModel import RolPermiso
from app.modules.usuarios.models.UsuarioModel import Usuario


class ServicioPermisosRol:
    @staticmethod
    async def consultar(id_rol: int) -> PermisosRolDTO:
        rol = await Rol.filter(id=id_rol, activo=True).first()
        if rol is None:
            raise LookupError("El rol no existe o está inactivo.")

        if rol.codigo == "ADMINISTRADOR":
            # El administrador tiene todos los permisos por diseño, incluso los nuevos.
            ids = await Permiso.all().values_list("id", flat=True)
        else:
            ids = await RolPermiso.filter(rol_id=id_rol).values_list(
                "permiso_id", flat=True
            )
        return PermisosRolDTO(id_rol=id_rol, ids_permisos=sorted(ids))

    @staticmethod
    async def guardar(
        id_rol: int,
        ids_permisos: list[int],
        usuario_actor: Usuario,
    ) -> PermisosRolDTO:
        if any(id_permiso <= 0 for id_permiso in ids_permisos):
            raise ValueError("Los IDs de permisos deben ser positivos.")
        if len(ids_permisos) != len(set(ids_permisos)):
            raise ValueError("Hay permisos duplicados.")

        async with in_transaction() as conexion:
            rol = await Rol.filter(id=id_rol).using_db(
                conexion
            ).select_for_update().first()
            if rol is None or not rol.activo:
                raise LookupError("El rol no existe o está inactivo.")
            if rol.codigo == "ADMINISTRADOR":
                raise ValueError("Los permisos de ADMINISTRADOR son globales e inmutables.")

            permisos = await Permiso.filter(id__in=ids_permisos).using_db(conexion)
            if {permiso.id for permiso in permisos} != set(ids_permisos):
                raise ValueError("Uno o más permisos no existen.")

            # Evita que una edición convierta otro rol en administrador de accesos.
            if any(
                permiso.codigo.startswith(("usuarios.", "roles.", "grupos."))
                for permiso in permisos
            ):
                raise ValueError(
                    "Los permisos de administración de accesos son exclusivos de ADMINISTRADOR."
                )

            anteriores = list(await RolPermiso.filter(
                rol_id=id_rol
            ).using_db(conexion).values_list("permiso_id", flat=True))

            if set(anteriores) != set(ids_permisos):
                await RolPermiso.filter(rol_id=id_rol).using_db(conexion).delete()
                for id_permiso in ids_permisos:
                    await RolPermiso.create(
                        rol_id=id_rol, permiso_id=id_permiso, using_db=conexion
                    )
                await AuditoriaPermisosRol.create(
                    rol_id=id_rol,
                    actor_id=usuario_actor.id,
                    permisos_anteriores=sorted(anteriores),
                    permisos_nuevos=sorted(ids_permisos),
                    using_db=conexion,
                )

        return await ServicioPermisosRol.consultar(id_rol)
