from tortoise.transactions import in_transaction

from app.modules.usuarios.dao.PerfilInstitucionalDAO import PerfilInstitucionalDAO
from app.modules.usuarios.dao.UsuarioDAO import UsuarioDAO
from app.modules.usuarios.models.UsuarioModel import Usuario
from app.modules.usuarios.models.catalogos.EstatusUsuarioModel import EstadoUsuario


class ServicioValidacionUsuario:
    
    def __init__(self):
        self.dao_usuario = UsuarioDAO()
        self.dao_perfil = PerfilInstitucionalDAO()

    async def aprobar_usuario(
        self,
        id_usuario: int,
        usuario_validador: Usuario,
        observaciones: str | None = None,
    ) -> Usuario:
        usuario, perfil = await self._obtener_usuario_y_perfil(id_usuario)
        self._validar_pendiente(usuario)

        async with in_transaction() as conexion:
            await self.dao_perfil.registrar_revision(
                perfil=perfil,
                usuario_validador=usuario_validador,
                observaciones=observaciones,
                usando_bd=conexion,
            )

            await self.dao_usuario.actualizar_estado(
                usuario=usuario,
                estado=EstadoUsuario.ACTIVO,
                usando_bd=conexion,
            )

        return usuario

    async def rechazar_usuario(
        self,
        id_usuario: int,
        usuario_validador: Usuario,
        observaciones: str,
    ) -> Usuario:
        observaciones = observaciones.strip()
        if not observaciones:
            raise ValueError("El motivo del rechazo es obligatorio.")

        usuario, perfil = await self._obtener_usuario_y_perfil(id_usuario)
        self._validar_pendiente(usuario)

        async with in_transaction() as conexion:
            await self.dao_perfil.registrar_revision(
                perfil=perfil,
                usuario_validador=usuario_validador,
                observaciones=observaciones,
                usando_bd=conexion,
            )

            await self.dao_usuario.actualizar_estado(
                usuario=usuario,
                estado=EstadoUsuario.RECHAZADO,
                usando_bd=conexion,
            )

        return usuario

    async def suspender_usuario(self, id_usuario: int) -> Usuario:
        usuario = await self.dao_usuario.obtener_por_id(id_usuario)
        if usuario is None:
            raise ValueError("Usuario no encontrado.")

        return await self.dao_usuario.actualizar_estado(
            usuario=usuario,
            estado=EstadoUsuario.SUSPENDIDO,
        )

    async def _obtener_usuario_y_perfil(self, id_usuario: int):
        usuario = await self.dao_usuario.obtener_por_id(id_usuario)
        if usuario is None:
            raise ValueError("Usuario no encontrado.")

        perfil = await self.dao_perfil.obtener_por_usuario_id(id_usuario)
        if perfil is None:
            raise ValueError("El usuario no tiene un perfil institucional registrado.")

        return usuario, perfil

    @staticmethod
    def _validar_pendiente(usuario: Usuario) -> None:
        if usuario.estado != EstadoUsuario.PENDIENTE_VALIDACION:
            raise ValueError("El usuario no se encuentra pendiente de validación.")
