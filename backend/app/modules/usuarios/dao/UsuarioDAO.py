from datetime import date
from app.modules.usuarios.models.UsuarioModel import Usuario
from app.modules.usuarios.models.catalogos.EstatusUsuarioModel import EstadoUsuario

class UsuarioDAO:

    @staticmethod
    async def obtener_por_id(
        id_usuario: int,
        usando_bd=None,
        bloquear: bool = False,
    ) -> Usuario | None:
        consulta = Usuario.filter(id=id_usuario)

        if usando_bd is not None:
            consulta = consulta.using_db(usando_bd)

        if bloquear:
            consulta = consulta.select_for_update()

        return await consulta.first()
    
    @staticmethod
    async def crear(
        datos,
        usando_bd=None,
    ) -> Usuario:

        return await Usuario.create(
            nombre=datos.nombre,
            primer_apellido=datos.primer_apellido,
            segundo_apellido=datos.segundo_apellido,
            correo=datos.correo,
            telefono=datos.telefono,
            curp=datos.curp,
            fecha_nacimiento=datos.fecha_nacimiento,
            sexo=datos.sexo,
            estado=EstadoUsuario.PENDIENTE_REGISTRO,
            using_db=usando_bd,
        )

    @staticmethod
    async def actualizar_datos_llave_mx(
        usuario: Usuario,
        datos,
        usando_bd=None,
    ) -> Usuario:

        usuario.nombre = datos.nombre
        usuario.primer_apellido = (datos.primer_apellido)
        usuario.segundo_apellido = (datos.segundo_apellido)
        usuario.correo = datos.correo
        usuario.telefono = datos.telefono
        usuario.curp = datos.curp
        usuario.fecha_nacimiento = (datos.fecha_nacimiento)
        usuario.sexo = datos.sexo
        await usuario.save(using_db=usando_bd)
        return usuario

    @staticmethod
    async def actualizar_estado(
        usuario: Usuario,
        estado: EstadoUsuario,
        usando_bd=None,
    ) -> Usuario:

        usuario.estado = estado

        await usuario.save(
            using_db=usando_bd
        )

        return usuario
