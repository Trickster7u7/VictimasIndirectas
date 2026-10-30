from fastapi import Depends, HTTPException
from app.core.configuracion import configuracion

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


def exigir_permiso_en_rutas_existentes(codigo_permiso: str):
    """Despliegue gradual de RBAC para rutas que ya usa QAS.

    Antes de activar RBAC_PROTEGER_RUTAS_EXISTENTES, se mantienen las mismas
    comprobaciones de usuario activo. Nunca usar para rutas administrativas
    nuevas; estas siempre deben exigir permisos explícitos.
    """
    if getattr(configuracion, "rbac_proteger_rutas_existentes", False):
        return exigir_permiso(codigo_permiso)
    return obtener_usuario_activo
