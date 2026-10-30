"""Migración aditiva para auditar cambios de permisos por rol.

No elimina ni altera roles, grupos, usuarios o sesiones.
"""

from tortoise import fields, migrations
from tortoise.fields.base import OnDelete
from tortoise.migrations import operations as ops


class Migration(migrations.Migration):
    dependencies = [("modelos", "0004_roles_permisos")]
    initial = False

    operations = [
        ops.CreateModel(
            name="AuditoriaPermisosRol",
            fields=[
                ("id", fields.IntField(generated=True, primary_key=True, unique=True, db_index=True)),
                ("rol", fields.ForeignKeyField(
                    "modelos.Rol", source_field="rol_id", to_field="id",
                    related_name="historial_permisos", on_delete=OnDelete.RESTRICT,
                )),
                ("actor", fields.ForeignKeyField(
                    "modelos.Usuario", source_field="actor_id", to_field="id",
                    related_name="permisos_roles_modificados", on_delete=OnDelete.RESTRICT,
                )),
                ("permisos_anteriores", fields.JSONField()),
                ("permisos_nuevos", fields.JSONField()),
                ("fecha_cambio", fields.DatetimeField(auto_now_add=True)),
            ],
            options={"table": "auditoria_permisos_roles", "app": "modelos", "pk_attr": "id"},
            bases=["Model"],
        ),
    ]
