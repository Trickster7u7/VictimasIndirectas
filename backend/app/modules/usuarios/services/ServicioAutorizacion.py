from app.modules.usuarios.dao.AccesosDAO import AccesosDAO
from app.modules.usuarios.models.UsuarioModel import Usuario
from app.modules.usuarios.models.catalogos.EstatusUsuarioModel import EstadoUsuario


class ServicioAutorizacion:
    @staticmethod
    async def obtener_permisos(usuario: Usuario) -> set[str]:
        # El estado del usuario siempre prevalece sobre los roles asignados.
        if usuario.estado != EstadoUsuario.ACTIVO:
            return set()
        return await AccesosDAO.obtener_codigos_permisos(usuario.id)

    @staticmethod
    async def tiene_permiso(usuario: Usuario, codigo: str) -> bool:
        return codigo in await ServicioAutorizacion.obtener_permisos(usuario)
