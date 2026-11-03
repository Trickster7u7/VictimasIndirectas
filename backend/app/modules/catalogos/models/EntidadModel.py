from tortoise import fields, models


class Entidad(models.Model):
    id = fields.IntField(pk=True)
    clave = fields.CharField(
        max_length=2,
        unique=True,
        description="Clave oficial de INEGI"
    )
    nombre = fields.CharField(max_length=100)
    activo = fields.BooleanField(default=True)
    fecha_creacion = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "cat_entidades"
        ordering = ["nombre"]