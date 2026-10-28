"""Población explícita e idempotente. Nunca llamar en startup ni en login."""

from tortoise.transactions import in_transaction

from app.modules.usuarios.catalogos.CatalogoAccesos import PERMISOS, ROLES
from app.modules.usuarios.models.PermisoModel import Permiso
from app.modules.usuarios.models.RolModel import Rol
from app.modules.usuarios.models.RolPermisoModel import RolPermiso


class ServicioCatalogoAccesos:
    @staticmethod
    async def sembrar_catalogo_inicial() -> None:
        """Uso administrativo manual, después de migrar y revisar el catálogo.

        Solo agrega elementos faltantes: no elimina ni cambia permisos ya asignados.
        """
        async with in_transaction() as conexion:
            for codigo, (modulo, nombre) in PERMISOS.items():
                await Permiso.get_or_create(
                    codigo=codigo,
                    defaults={"nombre": nombre, "modulo": modulo},
                    using_db=conexion,
                )

            for codigo, datos in ROLES.items():
                rol, _ = await Rol.get_or_create(
                    codigo=codigo,
                    defaults={
                        "nombre": datos["nombre"],
                        "activo": True,
                        "es_sistema": True,
                    },
                    using_db=conexion,
                )
                for codigo_permiso in datos["permisos"]:
                    permiso = await Permiso.get(
                        codigo=codigo_permiso, using_db=conexion
                    )
                    await RolPermiso.get_or_create(
                        rol_id=rol.id,
                        permiso_id=permiso.id,
                        using_db=conexion,
                    )
