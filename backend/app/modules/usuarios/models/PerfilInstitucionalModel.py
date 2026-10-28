from tortoise import fields
from tortoise.models import Model


class PerfilInstitucional(Model):
    id = fields.IntField(primary_key=True)
    usuario = fields.OneToOneField("modelos.Usuario", related_name="perfil_institucional", on_delete=fields.CASCADE)
    institucion = fields.CharField(max_length=200)
    area = fields.CharField(max_length=200, null=True)
    cargo = fields.CharField(max_length=200, null=True)
    telefono_institucional = fields.CharField(max_length=20, null=True)
    entidad_federativa = fields.CharField(max_length=100, null=True)

    observaciones_validacion = fields.TextField(null=True)
    fecha_envio_validacion = fields.DatetimeField(null=True)
    fecha_validacion = fields.DatetimeField(null=True)

    usuario_validador = fields.ForeignKeyField(
        "modelos.Usuario",
        related_name="perfiles_validados",
        null=True,
        on_delete=fields.SET_NULL,
    )

    fecha_creacion = fields.DatetimeField(auto_now_add=True)
    fecha_actualizacion = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "perfiles_institucionales"
