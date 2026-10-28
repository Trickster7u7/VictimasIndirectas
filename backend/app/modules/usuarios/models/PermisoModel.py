from tortoise import fields
from tortoise.models import Model


class Permiso(Model):
    id = fields.IntField(primary_key=True)
    codigo = fields.CharField(max_length=100, unique=True)
    nombre = fields.CharField(max_length=120)
    modulo = fields.CharField(max_length=50)
    descripcion = fields.TextField(null=True)

    class Meta:
        table = "permisos"
