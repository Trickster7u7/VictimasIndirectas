from app.modules.usuarios.models.GrupoRolModel import GrupoRol
from app.modules.usuarios.models.PermisoModel import Permiso
from app.modules.usuarios.models.RolModel import Rol
from app.modules.usuarios.models.RolPermisoModel import RolPermiso
from app.modules.usuarios.models.UsuarioRolModel import UsuarioRol
from app.modules.usuarios.models.UsuarioGrupoModel import UsuarioGrupo


class AccesosDAO:
    @staticmethod
    async def obtener_codigos_permisos(id_usuario: int) -> set[str]:
        # ADMINISTRADOR se asigna exclusivamente de forma directa y tiene
        # todos los permisos registrados, incluidos los agregados a futuro.
        es_administrador = await UsuarioRol.filter(
            usuario_id=id_usuario, rol__codigo="ADMINISTRADOR", rol__activo=True
        ).exists()
        if es_administrador:
            return set(await Permiso.all().values_list("codigo", flat=True))

        # Roles excepcionales asignados directamente a la cuenta.
        ids_directos = await UsuarioRol.filter(
            usuario_id=id_usuario, rol__activo=True
        ).values_list("rol_id", flat=True)

        # Roles heredados de grupos activos. Administrador es exclusivo de
        # asignación directa para impedir privilegios globales por grupo.
        ids_grupos = await UsuarioGrupo.filter(
            usuario_id=id_usuario, grupo__activo=True
        ).values_list("grupo_id", flat=True)
        ids_heredados = []
        if ids_grupos:
            ids_heredados = await GrupoRol.filter(
                grupo_id__in=ids_grupos, rol__activo=True
            ).exclude(rol__codigo="ADMINISTRADOR").values_list(
                "rol_id", flat=True
            )

        ids_roles = set(ids_directos) | set(ids_heredados)
        if not ids_roles:
            return set()

        ids_permisos = await RolPermiso.filter(
            rol_id__in=ids_roles
        ).values_list("permiso_id", flat=True)
        if not ids_permisos:
            return set()

        codigos = await Permiso.filter(
            id__in=ids_permisos
        ).values_list("codigo", flat=True)
        return set(codigos)

    @staticmethod
    async def obtener_roles_usuario(id_usuario: int) -> list[Rol]:
        ids_roles = await UsuarioRol.filter(
            usuario_id=id_usuario
        ).values_list("rol_id", flat=True)
        if not ids_roles:
            return []
        return await Rol.filter(id__in=ids_roles).order_by("nombre")
