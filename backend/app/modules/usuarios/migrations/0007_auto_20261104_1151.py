from tortoise import migrations
from tortoise.migrations import operations as ops
from tortoise import fields

class Migration(migrations.Migration):
    dependencies = [('modelos', '0006_agregar_catalogo_entidades')]

    initial = False

    operations = [
        ops.AlterModelOptions(
            name='AuditoriaGrupos',
            options={'table': 'auditoria_grupos', 'app': 'modelos', 'pk_attr': 'id', 'table_description': 'Registra cambios de membresía y de roles asignados a un grupo.'},
        ),
        ops.AlterModelOptions(
            name='AuditoriaPermisosRol',
            options={'table': 'auditoria_permisos_roles', 'app': 'modelos', 'pk_attr': 'id', 'table_description': 'Traza de cambios al catálogo de permisos de un rol.'},
        ),
        ops.AlterModelOptions(
            name='Grupo',
            options={'table': 'grupos', 'app': 'modelos', 'pk_attr': 'id', 'table_description': 'Unidad funcional o administrativa; no sustituye al perfil institucional.'},
        ),
        ops.AddField(
            model_name='SesionUsuario',
            name='token_llave_mx_cifrado',
            field=fields.TextField(null=True, unique=False),
        ),
        ops.AddField(
            model_name='SesionUsuario',
            name='token_llave_mx_expiracion',
            field=fields.DatetimeField(null=True, auto_now=False, auto_now_add=False),
        ),
    ]
