from datetime import datetime
from app.modules.usuarios.models.SesionUsuarioModel import (SesionUsuario)
from app.modules.usuarios.models.UsuarioModel import (Usuario)


class SesionUsuarioDAO:

    @staticmethod
    async def crear(
        usuario: Usuario,
        hash_token: str,
        fecha_expiracion: datetime,
    ) -> SesionUsuario:

        return await SesionUsuario.create(
            usuario=usuario,
            hash_token=hash_token,
            fecha_expiracion=fecha_expiracion,
        )

    @staticmethod
    async def buscar_por_hash_token(
        hash_token: str,
    ) -> SesionUsuario | None:

        return await (
            SesionUsuario
            .filter(
                hash_token=hash_token,
                revocada=False,
            )
            .prefetch_related("usuario")
            .first()
        )

    @staticmethod
    async def revocar(
        sesion: SesionUsuario,
        fecha_revocacion: datetime,
    ) -> SesionUsuario:

        sesion.revocada = True
        sesion.fecha_revocacion = fecha_revocacion

        await sesion.save(
            update_fields=[
                "revocada",
                "fecha_revocacion",
                "actualizado_en",
            ]
        )

        return sesion