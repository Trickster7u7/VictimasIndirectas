from app.modules.usuarios.models.IdentidadLlaveMxModel import (IdentidadLlaveMX)
from app.modules.usuarios.models.UsuarioModel import (Usuario)

class IdentidadLlaveMxDAO:

    @staticmethod
    async def buscar_por_id_usuario_llave_mx(
        id_usuario_llave_mx: int,
        usando_bd=None,
    ) -> IdentidadLlaveMX | None:

        consulta = IdentidadLlaveMX.filter(
            id_usuario_llave_mx=id_usuario_llave_mx
        )

        if usando_bd is not None:
            consulta = consulta.using_db(
                usando_bd
            )
        return await consulta.first()

    @staticmethod
    async def crear(
        usuario: Usuario,
        id_usuario_llave_mx: int,
        login: str,
        usando_bd=None,
    ) -> IdentidadLlaveMX:

        return await IdentidadLlaveMX.create(
            usuario=usuario,
            id_usuario_llave_mx=(
                id_usuario_llave_mx
            ),
            login=login,
            using_db=usando_bd,
        )

    @staticmethod
    async def actualizar_login(
        identidad: IdentidadLlaveMX,
        login: str,
        usando_bd=None,
    ) -> IdentidadLlaveMX:

        identidad.login = login

        await identidad.save(
            using_db=usando_bd
        )
        return identidad