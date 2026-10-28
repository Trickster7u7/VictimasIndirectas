from tortoise import fields
from tortoise.models import Model


class RolPermiso(Model):
    id = fields.IntField(primary_key=True)
    rol = fields.ForeignKeyField(
        "modelos.Rol", related_name="permisos_asignados", on_delete=fields.CASCADE
    )
    permiso = fields.ForeignKeyField(
        "modelos.Permiso", related_name="roles_asignados", on_delete=fields.RESTRICT
    )

    class Meta:
        table = "rol_permisos"
        unique_together = (("rol", "permiso"),)
