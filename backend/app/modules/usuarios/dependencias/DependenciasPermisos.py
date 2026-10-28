from fastapi import Depends, HTTPException

from app.modules.usuarios.dependencias.DependenciasAutenticacion import (
    obtener_usuario_activo,
)
from app.modules.usuarios.models.UsuarioModel import Usuario
from app.modules.usuarios.services.ServicioAutorizacion import ServicioAutorizacion


def exigir_permiso(codigo_permiso: str):
    """Dependencia reutilizable: Depends(exigir_permiso('usuarios.consultar'))."""

    async def verificar(usuario: Usuario = Depends(obtener_usuario_activo)) -> Usuario:
        if not await ServicioAutorizacion.tiene_permiso(usuario, codigo_permiso):
            raise HTTPException(status_code=403, detail="Permiso insuficiente.")
        return usuario

    return verificar
