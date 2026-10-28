from tortoise import migrations
from tortoise.migrations import operations as ops
import functools
from json import dumps, loads
from tortoise.fields.base import OnDelete
from tortoise import fields

class Migration(migrations.Migration):
    dependencies = [('modelos', '0002_agregar_sesiones_usuario')]

    initial = False

    operations = [
        ops.CreateModel(
            name='DescargaVictimas',
            fields=[
                ('id', fields.IntField(generated=True, primary_key=True, unique=True, db_index=True)),
                ('anio', fields.IntField()),
                ('mes', fields.IntField()),
                ('origen', fields.CharField(default='JSON_LOCAL', max_length=20)),
                ('estado', fields.CharField(default='pendiente', max_length=20)),
                ('cantidad_registros', fields.IntField(default=0)),
                ('verificado_api', fields.BooleanField(default=False)),
                ('fecha_creacion', fields.DatetimeField(auto_now=False, auto_now_add=True)),
                ('fecha_descarga', fields.DatetimeField(null=True, auto_now=False, auto_now_add=False)),
            ],
            options={'table': 'descargas_victimas', 'app': 'modelos', 'unique_together': (('anio', 'mes'),), 'pk_attr': 'id'},
            bases=['Model'],
        ),
        ops.CreateModel(
            name='RegistroVictimaDescargado',
            fields=[
                ('id', fields.IntField(generated=True, primary_key=True, unique=True, db_index=True)),
                ('descarga', fields.ForeignKeyField('modelos.DescargaVictimas', source_field='descarga_id', db_constraint=True, to_field='id', related_name='registros', on_delete=OnDelete.RESTRICT)),
                ('hash_contenido', fields.CharField(db_index=True, max_length=64)),
                ('ocurrencia', fields.IntField(default=1)),
                ('identificador_victima', fields.CharField(null=True, db_index=True, max_length=200)),
                ('nombre', fields.CharField(null=True, max_length=200)),
                ('primer_apellido', fields.CharField(null=True, max_length=200)),
                ('segundo_apellido', fields.CharField(null=True, max_length=200)),
                ('curp', fields.CharField(null=True, db_index=True, max_length=18)),
                ('tipo_victima', fields.CharField(null=True, max_length=300)),
                ('tipo_persona_moral', fields.CharField(null=True, max_length=300)),
                ('sexo', fields.CharField(null=True, max_length=100)),
                ('genero', fields.CharField(null=True, max_length=100)),
                ('poblacion_indigena', fields.CharField(null=True, max_length=300)),
                ('discapacidad', fields.CharField(null=True, max_length=300)),
                ('fecha_nacimiento', fields.CharField(null=True, max_length=40)),
                ('edad', fields.IntField(null=True)),
                ('nacionalidad', fields.CharField(null=True, max_length=200)),
                ('entidad_reportante', fields.CharField(null=True, max_length=200)),
                ('usuario_reportante', fields.CharField(null=True, max_length=300)),
                ('anio_corte', fields.IntField(null=True)),
                ('mes_corte', fields.CharField(null=True, max_length=30)),
                ('identificador_carpeta', fields.CharField(null=True, db_index=True, max_length=200)),
                ('numero_carpeta', fields.CharField(null=True, db_index=True, max_length=300)),
                ('fecha_inicio_carpeta', fields.CharField(null=True, max_length=40)),
                ('hora_inicio_carpeta', fields.CharField(null=True, max_length=30)),
                ('resumen_hechos', fields.TextField(null=True, unique=False)),
                ('identificador_delito', fields.CharField(null=True, db_index=True, max_length=200)),
                ('delito_fiscalia', fields.TextField(null=True, unique=False)),
                ('modalidad_fiscalia', fields.TextField(null=True, unique=False)),
                ('bien_juridico', fields.TextField(null=True, unique=False)),
                ('delito_catalogo', fields.TextField(null=True, unique=False)),
                ('subtipo_delito', fields.TextField(null=True, unique=False)),
                ('modalidad_catalogo', fields.TextField(null=True, unique=False)),
                ('forma_accion', fields.TextField(null=True, unique=False)),
                ('instrumento_comision', fields.TextField(null=True, unique=False)),
                ('grado_consumacion', fields.CharField(null=True, max_length=300)),
                ('fecha_hechos', fields.CharField(null=True, max_length=40)),
                ('hora_hechos', fields.CharField(null=True, max_length=30)),
                ('bien_juridico_sabana', fields.TextField(null=True, unique=False)),
                ('delito_sabana', fields.TextField(null=True, unique=False)),
                ('subtipo_delito_sabana', fields.TextField(null=True, unique=False)),
                ('modalidad_delito_sabana', fields.TextField(null=True, unique=False)),
                ('entidad_hechos', fields.CharField(null=True, max_length=200)),
                ('municipio_hechos', fields.CharField(null=True, max_length=200)),
                ('localidad_hechos', fields.CharField(null=True, max_length=300)),
                ('colonia_hechos', fields.CharField(null=True, max_length=300)),
                ('codigo_postal', fields.CharField(null=True, max_length=20)),
                ('domicilio_hechos', fields.TextField(null=True, unique=False)),
                ('coordenada_x', fields.CharField(null=True, max_length=100)),
                ('coordenada_y', fields.CharField(null=True, max_length=100)),
                ('fecha_registro', fields.CharField(null=True, max_length=50)),
                ('datos_sspc', fields.JSONField(null=True, encoder=functools.partial(dumps, separators=(',', ':')), decoder=loads)),
                ('fecha_creacion', fields.DatetimeField(auto_now=False, auto_now_add=True)),
            ],
            options={'table': 'registros_victimas_descargados', 'app': 'modelos', 'unique_together': (('descarga', 'hash_contenido', 'ocurrencia'),), 'pk_attr': 'id'},
            bases=['Model'],
        ),
    ]
