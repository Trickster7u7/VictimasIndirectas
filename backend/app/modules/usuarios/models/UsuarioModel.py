from tortoise import fields
from tortoise.models import Model
from app.modules.usuarios.models.catalogos.EstatusUsuarioModel import EstadoUsuario


class Usuario(Model):
    id = fields.IntField(primary_key=True)
    curp = fields.CharField(max_length=18,unique=True,null=True)
    nombre = fields.CharField(max_length=100)
    primer_apellido = fields.CharField(max_length=100)
    segundo_apellido = fields.CharField(max_length=100, null=True)
    correo = fields.CharField(max_length=150, null=True)
    telefono = fields.CharField(max_length=20, null=True)
    fecha_nacimiento = fields.DateField(null=True)
    sexo = fields.CharField(max_length=30, null=True)
    estado = fields.CharEnumField(EstadoUsuario, default=EstadoUsuario.PENDIENTE_REGISTRO, max_length=30)
    fecha_creacion = fields.DatetimeField(auto_now_add=True)
    fecha_actualizacion = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "usuarios"
