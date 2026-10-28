from tortoise import fields
from tortoise.models import Model


class SesionUsuario(Model):
    id = fields.IntField(primary_key=True)
    usuario = fields.ForeignKeyField("modelos.Usuario", related_name="sesiones", on_delete=fields.CASCADE)
    hash_token = fields.CharField(max_length=64, unique=True, index=True)
    fecha_expiracion = fields.DatetimeField()
    revocada = fields.BooleanField(default=False)
    fecha_revocacion = fields.DatetimeField(null=True)
    creado_en = fields.DatetimeField(auto_now_add=True)
    actualizado_en = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "sesiones_usuario"