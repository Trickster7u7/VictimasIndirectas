from tortoise import fields
from tortoise.models import Model


class GrupoRol(Model):
    id = fields.IntField(primary_key=True)
    grupo = fields.ForeignKeyField(
        "modelos.Grupo", related_name="roles_asignados", on_delete=fields.CASCADE
    )
    rol = fields.ForeignKeyField(
        "modelos.Rol", related_name="grupos_asignados", on_delete=fields.RESTRICT
    )

    class Meta:
        table = "grupo_roles"
        unique_together = (("grupo", "rol"),)
