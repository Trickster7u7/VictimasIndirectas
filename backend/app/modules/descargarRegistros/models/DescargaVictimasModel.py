
from tortoise import fields, models


class DescargaVictimas(models.Model):
    id = fields.IntField(pk=True)

    anio = fields.IntField()
    mes = fields.IntField()

    origen = fields.CharField(
        max_length=20,
        default="JSON_LOCAL"
    )

    estado = fields.CharField(
        max_length=20,
        default="pendiente"
    )

    cantidad_registros = fields.IntField(default=0)
    verificado_api = fields.BooleanField(default=False)
    fecha_creacion = fields.DatetimeField(auto_now_add=True)
    fecha_descarga = fields.DatetimeField(null=True)

    class Meta:
        table = "descargas_victimas"
        unique_together = (("anio", "mes"),)
