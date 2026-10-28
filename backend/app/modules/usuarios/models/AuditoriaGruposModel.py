from tortoise import fields
from tortoise.models import Model


class AuditoriaGrupos(Model):
    """Registra cambios de membresía y de roles asignados a un grupo."""

    id = fields.IntField(primary_key=True)
    actor = fields.ForeignKeyField(
        "modelos.Usuario", related_name="cambios_grupos_realizados",
        on_delete=fields.RESTRICT,
    )
    tipo_cambio = fields.CharField(max_length=30)
    usuario = fields.ForeignKeyField(
        "modelos.Usuario", null=True, related_name="historial_membresias",
        on_delete=fields.RESTRICT,
    )
    grupo = fields.ForeignKeyField(
        "modelos.Grupo", null=True, related_name="historial_roles",
        on_delete=fields.RESTRICT,
    )
    ids_anteriores = fields.JSONField()
    ids_nuevos = fields.JSONField()
    fecha_cambio = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "auditoria_grupos"
