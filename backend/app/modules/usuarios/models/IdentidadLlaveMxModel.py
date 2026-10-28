from tortoise import fields
from tortoise.models import Model


class IdentidadLlaveMX(Model):
    id = fields.IntField(primary_key=True)
    usuario = fields.OneToOneField("modelos.Usuario", related_name="identidad_llave_mx", on_delete=fields.CASCADE)
    id_usuario_llave_mx = fields.BigIntField(unique=True,index=True)
    login = fields.CharField(max_length=200, null=True)
    fecha_vinculacion = fields.DatetimeField( auto_now_add=True)
    fecha_actualizacion = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "identidades_llave_mx"