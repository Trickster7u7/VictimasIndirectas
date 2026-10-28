from tortoise import migrations
from tortoise.migrations import operations as ops
from tortoise.fields.base import OnDelete
from tortoise import fields

class Migration(migrations.Migration):
    dependencies = [('modelos', '0001_inicial_usuarios')]

    initial = False

    operations = [
        ops.CreateModel(
            name='SesionUsuario',
            fields=[
                ('id', fields.IntField(generated=True, primary_key=True, unique=True, db_index=True)),
                ('usuario', fields.ForeignKeyField('modelos.Usuario', source_field='usuario_id', db_constraint=True, to_field='id', related_name='sesiones', on_delete=OnDelete.CASCADE)),
                ('hash_token', fields.CharField(unique=True, db_index=True, max_length=64)),
                ('fecha_expiracion', fields.DatetimeField(auto_now=False, auto_now_add=False)),
                ('revocada', fields.BooleanField(default=False)),
                ('fecha_revocacion', fields.DatetimeField(null=True, auto_now=False, auto_now_add=False)),
                ('creado_en', fields.DatetimeField(auto_now=False, auto_now_add=True)),
                ('actualizado_en', fields.DatetimeField(auto_now=True, auto_now_add=False)),
            ],
            options={'table': 'sesiones_usuario', 'app': 'modelos', 'pk_attr': 'id'},
            bases=['Model'],
        ),
    ]
