from tortoise import fields
from tortoise.models import Model


class AuditoriaRoles(Model):
    id = fields.IntField(primary_key=True)
    actor = fields.ForeignKeyField(
        "modelos.Usuario", related_name="cambios_roles_realizados",
        on_delete=fields.RESTRICT,
    )
    usuario = fields.ForeignKeyField(
        "modelos.Usuario", related_name="historial_cambios_roles",
        on_delete=fields.RESTRICT,
    )
    roles_anteriores = fields.JSONField()
    roles_nuevos = fields.JSONField()
    fecha_cambio = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "auditoria_roles"
