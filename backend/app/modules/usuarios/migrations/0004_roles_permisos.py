"""Migración aditiva: crea tablas de roles, grupos y auditoría.

IMPORTANTE: revisar contra la configuración real de modelos antes de aplicarla.
No ejecutarla desde el ZIP; local y QAS comparten la base de datos vi_test.
"""

from tortoise import fields, migrations
from tortoise.fields.base import OnDelete
from tortoise.migrations import operations as ops


class Migration(migrations.Migration):
    dependencies = [("modelos", "0003_agregar_registros_victimas")]
    initial = False

    operations = [
        ops.CreateModel(
            name="Rol",
            fields=[
                ("id", fields.IntField(generated=True, primary_key=True, unique=True, db_index=True)),
                ("codigo", fields.CharField(max_length=50, unique=True)),
                ("nombre", fields.CharField(max_length=100)),
                ("descripcion", fields.TextField(null=True)),
                ("activo", fields.BooleanField(default=True)),
                ("es_sistema", fields.BooleanField(default=True)),
                ("fecha_creacion", fields.DatetimeField(auto_now_add=True)),
                ("fecha_actualizacion", fields.DatetimeField(auto_now=True)),
            ],
            options={"table": "roles", "app": "modelos", "pk_attr": "id"},
            bases=["Model"],
        ),
        ops.CreateModel(
            name="Permiso",
            fields=[
                ("id", fields.IntField(generated=True, primary_key=True, unique=True, db_index=True)),
                ("codigo", fields.CharField(max_length=100, unique=True)),
                ("nombre", fields.CharField(max_length=120)),
                ("modulo", fields.CharField(max_length=50)),
                ("descripcion", fields.TextField(null=True)),
            ],
            options={"table": "permisos", "app": "modelos", "pk_attr": "id"},
            bases=["Model"],
        ),
        ops.CreateModel(
            name="UsuarioRol",
            fields=[
                ("id", fields.IntField(generated=True, primary_key=True, unique=True, db_index=True)),
                ("usuario", fields.ForeignKeyField(
                    "modelos.Usuario", source_field="usuario_id", to_field="id",
                    related_name="roles_asignados", on_delete=OnDelete.CASCADE,
                )),
                ("rol", fields.ForeignKeyField(
                    "modelos.Rol", source_field="rol_id", to_field="id",
                    related_name="usuarios_asignados", on_delete=OnDelete.RESTRICT,
                )),
                ("asignado_por", fields.ForeignKeyField(
                    "modelos.Usuario", source_field="asignado_por_id", to_field="id",
                    null=True, related_name="roles_otorgados", on_delete=OnDelete.SET_NULL,
                )),
                ("fecha_asignacion", fields.DatetimeField(auto_now_add=True)),
            ],
            options={
                "table": "usuario_roles", "app": "modelos", "pk_attr": "id",
                "unique_together": (("usuario", "rol"),),
            },
            bases=["Model"],
        ),
        ops.CreateModel(
            name="RolPermiso",
            fields=[
                ("id", fields.IntField(generated=True, primary_key=True, unique=True, db_index=True)),
                ("rol", fields.ForeignKeyField(
                    "modelos.Rol", source_field="rol_id", to_field="id",
                    related_name="permisos_asignados", on_delete=OnDelete.CASCADE,
                )),
                ("permiso", fields.ForeignKeyField(
                    "modelos.Permiso", source_field="permiso_id", to_field="id",
                    related_name="roles_asignados", on_delete=OnDelete.RESTRICT,
                )),
            ],
            options={
                "table": "rol_permisos", "app": "modelos", "pk_attr": "id",
                "unique_together": (("rol", "permiso"),),
            },
            bases=["Model"],
        ),
        ops.CreateModel(
            name="AuditoriaRoles",
            fields=[
                ("id", fields.IntField(generated=True, primary_key=True, unique=True, db_index=True)),
                ("actor", fields.ForeignKeyField(
                    "modelos.Usuario", source_field="actor_id", to_field="id",
                    related_name="cambios_roles_realizados", on_delete=OnDelete.RESTRICT,
                )),
                ("usuario", fields.ForeignKeyField(
                    "modelos.Usuario", source_field="usuario_id", to_field="id",
                    related_name="historial_cambios_roles", on_delete=OnDelete.RESTRICT,
                )),
                ("roles_anteriores", fields.JSONField()),
                ("roles_nuevos", fields.JSONField()),
                ("fecha_cambio", fields.DatetimeField(auto_now_add=True)),
            ],
            options={"table": "auditoria_roles", "app": "modelos", "pk_attr": "id"},
            bases=["Model"],
        ),
        ops.CreateModel(
            name="Grupo",
            fields=[
                ("id", fields.IntField(generated=True, primary_key=True, unique=True, db_index=True)),
                ("codigo", fields.CharField(max_length=50, unique=True)),
                ("nombre", fields.CharField(max_length=120)),
                ("descripcion", fields.TextField(null=True)),
                ("activo", fields.BooleanField(default=True)),
                ("fecha_creacion", fields.DatetimeField(auto_now_add=True)),
                ("fecha_actualizacion", fields.DatetimeField(auto_now=True)),
            ],
            options={"table": "grupos", "app": "modelos", "pk_attr": "id"},
            bases=["Model"],
        ),
        ops.CreateModel(
            name="UsuarioGrupo",
            fields=[
                ("id", fields.IntField(generated=True, primary_key=True, unique=True, db_index=True)),
                ("usuario", fields.ForeignKeyField(
                    "modelos.Usuario", source_field="usuario_id", to_field="id",
                    related_name="grupos_asignados", on_delete=OnDelete.CASCADE,
                )),
                ("grupo", fields.ForeignKeyField(
                    "modelos.Grupo", source_field="grupo_id", to_field="id",
                    related_name="usuarios_asignados", on_delete=OnDelete.RESTRICT,
                )),
                ("asignado_por", fields.ForeignKeyField(
                    "modelos.Usuario", source_field="asignado_por_id", to_field="id",
                    null=True, related_name="grupos_otorgados", on_delete=OnDelete.SET_NULL,
                )),
                ("fecha_asignacion", fields.DatetimeField(auto_now_add=True)),
            ],
            options={
                "table": "usuario_grupos", "app": "modelos", "pk_attr": "id",
                "unique_together": (("usuario", "grupo"),),
            },
            bases=["Model"],
        ),
        ops.CreateModel(
            name="GrupoRol",
            fields=[
                ("id", fields.IntField(generated=True, primary_key=True, unique=True, db_index=True)),
                ("grupo", fields.ForeignKeyField(
                    "modelos.Grupo", source_field="grupo_id", to_field="id",
                    related_name="roles_asignados", on_delete=OnDelete.CASCADE,
                )),
                ("rol", fields.ForeignKeyField(
                    "modelos.Rol", source_field="rol_id", to_field="id",
                    related_name="grupos_asignados", on_delete=OnDelete.RESTRICT,
                )),
            ],
            options={
                "table": "grupo_roles", "app": "modelos", "pk_attr": "id",
                "unique_together": (("grupo", "rol"),),
            },
            bases=["Model"],
        ),
        ops.CreateModel(
            name="AuditoriaGrupos",
            fields=[
                ("id", fields.IntField(generated=True, primary_key=True, unique=True, db_index=True)),
                ("actor", fields.ForeignKeyField(
                    "modelos.Usuario", source_field="actor_id", to_field="id",
                    related_name="cambios_grupos_realizados", on_delete=OnDelete.RESTRICT,
                )),
                ("tipo_cambio", fields.CharField(max_length=30)),
                ("usuario", fields.ForeignKeyField(
                    "modelos.Usuario", source_field="usuario_id", to_field="id",
                    null=True, related_name="historial_membresias", on_delete=OnDelete.RESTRICT,
                )),
                ("grupo", fields.ForeignKeyField(
                    "modelos.Grupo", source_field="grupo_id", to_field="id",
                    null=True, related_name="historial_roles", on_delete=OnDelete.RESTRICT,
                )),
                ("ids_anteriores", fields.JSONField()),
                ("ids_nuevos", fields.JSONField()),
                ("fecha_cambio", fields.DatetimeField(auto_now_add=True)),
            ],
            options={"table": "auditoria_grupos", "app": "modelos", "pk_attr": "id"},
            bases=["Model"],
        ),
    ]
