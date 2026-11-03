from tortoise import fields, migrations
from tortoise.migrations import operations as ops


class Migration(migrations.Migration):

    dependencies = [
        ("modelos", "0005_auditoria_permisos_roles")
    ]

    initial = False

    operations = [
        ops.CreateModel(
            name="Entidad",
            fields=[
                (
                    "id",
                    fields.IntField(
                        generated=True,
                        primary_key=True,
                        unique=True,
                        db_index=True
                    )
                ),
                (
                    "clave",
                    fields.CharField(
                        max_length=2,
                        unique=True,
                        description="Clave oficial de INEGI"
                    )
                ),
                (
                    "nombre",
                    fields.CharField(
                        max_length=100
                    )
                ),
                (
                    "activo",
                    fields.BooleanField(
                        default=True
                    )
                ),
                (
                    "fecha_creacion",
                    fields.DatetimeField(
                        auto_now=False,
                        auto_now_add=True
                    )
                ),
            ],
            options={
                "table": "cat_entidades",
                "app": "modelos",
                "pk_attr": "id"
            },
            bases=["Model"],
        ),
    ]