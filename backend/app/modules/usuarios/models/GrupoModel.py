from tortoise import fields
from tortoise.models import Model


class Grupo(Model):
    """Unidad funcional o administrativa; no sustituye al perfil institucional."""

    id = fields.IntField(primary_key=True)
    codigo = fields.CharField(max_length=50, unique=True)
    nombre = fields.CharField(max_length=120)
    descripcion = fields.TextField(null=True)
    activo = fields.BooleanField(default=True)
    fecha_creacion = fields.DatetimeField(auto_now_add=True)
    fecha_actualizacion = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "grupos"
