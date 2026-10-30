from tortoise import fields
from tortoise.models import Model


class AuditoriaPermisosRol(Model):
    """Traza de cambios al catálogo de permisos de un rol."""

    id = fields.IntField(primary_key=True)
    rol = fields.ForeignKeyField(
        "modelos.Rol", related_name="historial_permisos", on_delete=fields.RESTRICT
    )
    actor = fields.ForeignKeyField(
        "modelos.Usuario", related_name="permisos_roles_modificados",
        on_delete=fields.RESTRICT,
    )
    permisos_anteriores = fields.JSONField()
    permisos_nuevos = fields.JSONField()
    fecha_cambio = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "auditoria_permisos_roles"
