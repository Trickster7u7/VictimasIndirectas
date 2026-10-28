from tortoise import fields
from tortoise.models import Model


class UsuarioGrupo(Model):
    id = fields.IntField(primary_key=True)
    usuario = fields.ForeignKeyField(
        "modelos.Usuario", related_name="grupos_asignados", on_delete=fields.CASCADE
    )
    grupo = fields.ForeignKeyField(
        "modelos.Grupo", related_name="usuarios_asignados", on_delete=fields.RESTRICT
    )
    asignado_por = fields.ForeignKeyField(
        "modelos.Usuario", related_name="grupos_otorgados",
        on_delete=fields.SET_NULL, null=True,
    )
    fecha_asignacion = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "usuario_grupos"
        unique_together = (("usuario", "grupo"),)
