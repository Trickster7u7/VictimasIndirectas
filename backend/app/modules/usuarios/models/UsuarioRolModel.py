from tortoise import fields
from tortoise.models import Model


class UsuarioRol(Model):
    id = fields.IntField(primary_key=True)
    usuario = fields.ForeignKeyField(
        "modelos.Usuario", related_name="roles_asignados", on_delete=fields.CASCADE
    )
    rol = fields.ForeignKeyField(
        "modelos.Rol", related_name="usuarios_asignados", on_delete=fields.RESTRICT
    )
    asignado_por = fields.ForeignKeyField(
        "modelos.Usuario", related_name="roles_otorgados",
        on_delete=fields.SET_NULL, null=True,
    )
    fecha_asignacion = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "usuario_roles"
        unique_together = (("usuario", "rol"),)
