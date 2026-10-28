from tortoise import migrations
from tortoise.migrations import operations as ops
from app.modules.usuarios.models.catalogos.EstatusUsuarioModel import EstadoUsuario
from tortoise.fields.base import OnDelete
from tortoise import fields

class Migration(migrations.Migration):
    initial = True

    operations = [
        ops.CreateModel(
            name='Usuario',
            fields=[
                ('id', fields.IntField(generated=True, primary_key=True, unique=True, db_index=True)),
                ('curp', fields.CharField(null=True, unique=True, max_length=18)),
                ('nombre', fields.CharField(max_length=100)),
                ('primer_apellido', fields.CharField(max_length=100)),
                ('segundo_apellido', fields.CharField(null=True, max_length=100)),
                ('correo', fields.CharField(null=True, max_length=150)),
                ('telefono', fields.CharField(null=True, max_length=20)),
                ('fecha_nacimiento', fields.DateField(null=True)),
                ('sexo', fields.CharField(null=True, max_length=30)),
                ('estado', fields.CharEnumField(default=EstadoUsuario.PENDIENTE_REGISTRO, description='PENDIENTE_REGISTRO: PENDIENTE_REGISTRO\nPENDIENTE_VALIDACION: PENDIENTE_VALIDACION\nACTIVO: ACTIVO\nRECHAZADO: RECHAZADO\nSUSPENDIDO: SUSPENDIDO', enum_type=EstadoUsuario, max_length=30)),
                ('fecha_creacion', fields.DatetimeField(auto_now=False, auto_now_add=True)),
                ('fecha_actualizacion', fields.DatetimeField(auto_now=True, auto_now_add=False)),
            ],
            options={'table': 'usuarios', 'app': 'modelos', 'pk_attr': 'id'},
            bases=['Model'],
        ),
        ops.CreateModel(
            name='IdentidadLlaveMX',
            fields=[
                ('id', fields.IntField(generated=True, primary_key=True, unique=True, db_index=True)),
                ('usuario', fields.OneToOneField('modelos.Usuario', source_field='usuario_id', db_constraint=True, to_field='id', related_name='identidad_llave_mx', on_delete=OnDelete.CASCADE)),
                ('id_usuario_llave_mx', fields.BigIntField(unique=True, db_index=True)),
                ('login', fields.CharField(null=True, max_length=200)),
                ('fecha_vinculacion', fields.DatetimeField(auto_now=False, auto_now_add=True)),
                ('fecha_actualizacion', fields.DatetimeField(auto_now=True, auto_now_add=False)),
            ],
            options={'table': 'identidades_llave_mx', 'app': 'modelos', 'pk_attr': 'id'},
            bases=['Model'],
        ),
        ops.CreateModel(
            name='PerfilInstitucional',
            fields=[
                ('id', fields.IntField(generated=True, primary_key=True, unique=True, db_index=True)),
                ('usuario', fields.OneToOneField('modelos.Usuario', source_field='usuario_id', db_constraint=True, to_field='id', related_name='perfil_institucional', on_delete=OnDelete.CASCADE)),
                ('institucion', fields.CharField(max_length=200)),
                ('area', fields.CharField(null=True, max_length=200)),
                ('cargo', fields.CharField(null=True, max_length=200)),
                ('telefono_institucional', fields.CharField(null=True, max_length=20)),
                ('entidad_federativa', fields.CharField(null=True, max_length=100)),
                ('observaciones_validacion', fields.TextField(null=True, unique=False)),
                ('fecha_envio_validacion', fields.DatetimeField(null=True, auto_now=False, auto_now_add=False)),
                ('fecha_validacion', fields.DatetimeField(null=True, auto_now=False, auto_now_add=False)),
                ('usuario_validador', fields.ForeignKeyField('modelos.Usuario', source_field='usuario_validador_id', null=True, db_constraint=True, to_field='id', related_name='perfiles_validados', on_delete=OnDelete.SET_NULL)),
                ('fecha_creacion', fields.DatetimeField(auto_now=False, auto_now_add=True)),
                ('fecha_actualizacion', fields.DatetimeField(auto_now=True, auto_now_add=False)),
            ],
            options={'table': 'perfiles_institucionales', 'app': 'modelos', 'pk_attr': 'id'},
            bases=['Model'],
        ),
    ]
