from app.core.configuracion import configuracion
from fastapi import Depends, HTTPException

from app.modules.usuarios.dependencias.DependenciasAutenticacion import (
    obtener_usuario_activo,
)

from app.modules.usuarios.models.UsuarioModel import Usuario


def obtener_ids_autorizados() -> set[int]:

    usuarios = configuracion.sspc_sync_user_ids

    return {
        int(valor.strip())
        for valor in usuarios.split(",")
        if valor.strip().isdigit()
    }


def puede_sincronizar(usuario: Usuario) -> bool:

    # Permitir a todos los usuarios autenticados SOLO en pruebas
    entorno_pruebas = configuracion.entorno.strip().lower() in {
        "local",
        "desarrollo",
        "qas",
    }

    if entorno_pruebas and configuracion.sspc_sync_todos:
        return True

    # En producción se mantienen los permisos por ID
    return usuario.id in obtener_ids_autorizados()


async def obtener_usuario_sincronizador(
    usuario: Usuario = Depends(obtener_usuario_activo),
) -> Usuario:

    if not puede_sincronizar(usuario):
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para ejecutar la sincronización de víctimas.",
        )

    return usuario