from tortoise import fields
from tortoise.models import Model


class Rol(Model):
    id = fields.IntField(primary_key=True)
    codigo = fields.CharField(max_length=50, unique=True)
    nombre = fields.CharField(max_length=100)
    descripcion = fields.TextField(null=True)
    activo = fields.BooleanField(default=True)
    es_sistema = fields.BooleanField(default=True)
    fecha_creacion = fields.DatetimeField(auto_now_add=True)
    fecha_actualizacion = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "roles"
