from fastapi import APIRouter, Depends, HTTPException
from tortoise.exceptions import IntegrityError

from app.modules.usuarios.dependencias.DependenciasAutenticacion import (
    obtener_usuario_activo,
)
from app.modules.usuarios.dependencias.DependenciasPermisos import exigir_permiso
from app.modules.usuarios.dto.AccesosDTO import (
    AsignarRolesDTO,
    AsignarGruposDTO,
    CrearGrupoDTO,
    GrupoDTO,
    GruposUsuarioDTO,
    PermisoDTO,
    RolDTO,
    RolesGrupoDTO,
    RolesUsuarioDTO,
)
from app.modules.usuarios.models.UsuarioModel import Usuario
from app.modules.usuarios.services.ServicioAutorizacion import ServicioAutorizacion
from app.modules.usuarios.services.ServicioGestionAccesos import ServicioGestionAccesos
from app.modules.usuarios.services.ServicioGestionGrupos import ServicioGestionGrupos


router = APIRouter(prefix="/api/usuarios", tags=["Gestión de accesos"])


@router.get("/mis-permisos", response_model=list[str])
async def consultar_mis_permisos(
    usuario: Usuario = Depends(obtener_usuario_activo),
):
    return sorted(await ServicioAutorizacion.obtener_permisos(usuario))


@router.get(
    "/administracion/roles",
    response_model=list[RolDTO],
    dependencies=[Depends(exigir_permiso("roles.consultar"))],
)
async def listar_roles():
    return await ServicioGestionAccesos.listar_roles()


@router.get(
    "/administracion/permisos",
    response_model=list[PermisoDTO],
    dependencies=[Depends(exigir_permiso("roles.consultar"))],
)
async def listar_permisos():
    return await ServicioGestionAccesos.listar_permisos()


@router.get(
    "/administracion/usuarios/{id_usuario}/roles",
    response_model=RolesUsuarioDTO,
)
async def consultar_roles_usuario(
    id_usuario: int,
    usuario: Usuario = Depends(exigir_permiso("usuarios.consultar")),
):
    try:
        return await ServicioGestionAccesos.obtener_roles_usuario(id_usuario)
    except LookupError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.put(
    "/administracion/usuarios/{id_usuario}/roles",
    response_model=RolesUsuarioDTO,
)
async def actualizar_roles_usuario(
    id_usuario: int,
    datos: AsignarRolesDTO,
    usuario: Usuario = Depends(exigir_permiso("usuarios.asignar_roles")),
):
    try:
        return await ServicioGestionAccesos.asignar_roles(
            id_usuario=id_usuario, ids_roles=datos.ids_roles, usuario_actor=usuario
        )
    except LookupError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.get(
    "/administracion/grupos",
    response_model=list[GrupoDTO],
    dependencies=[Depends(exigir_permiso("grupos.consultar"))],
)
async def listar_grupos():
    return await ServicioGestionGrupos.listar_grupos()


@router.post(
    "/administracion/grupos",
    response_model=GrupoDTO,
    status_code=201,
)
async def crear_grupo(
    datos: CrearGrupoDTO,
    usuario: Usuario = Depends(exigir_permiso("grupos.gestionar")),
):
    try:
        return await ServicioGestionGrupos.crear_grupo(
            codigo=datos.codigo,
            nombre=datos.nombre,
            descripcion=datos.descripcion,
            usuario_actor=usuario,
        )
    except IntegrityError as error:
        raise HTTPException(status_code=409, detail="El código de grupo ya existe.") from error
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.get(
    "/administracion/usuarios/{id_usuario}/grupos",
    response_model=GruposUsuarioDTO,
    dependencies=[Depends(exigir_permiso("usuarios.consultar"))],
)
async def consultar_grupos_usuario(id_usuario: int):
    try:
        return await ServicioGestionGrupos.obtener_grupos_usuario(id_usuario)
    except LookupError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.put(
    "/administracion/usuarios/{id_usuario}/grupos",
    response_model=GruposUsuarioDTO,
)
async def actualizar_grupos_usuario(
    id_usuario: int,
    datos: AsignarGruposDTO,
    usuario: Usuario = Depends(exigir_permiso("usuarios.asignar_grupos")),
):
    try:
        return await ServicioGestionGrupos.asignar_grupos_usuario(
            id_usuario=id_usuario,
            ids_grupos=datos.ids_grupos,
            usuario_actor=usuario,
        )
    except LookupError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.get(
    "/administracion/grupos/{id_grupo}/roles",
    response_model=RolesGrupoDTO,
    dependencies=[Depends(exigir_permiso("grupos.consultar"))],
)
async def consultar_roles_grupo(id_grupo: int):
    try:
        return await ServicioGestionGrupos.obtener_roles_grupo(id_grupo)
    except LookupError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.put(
    "/administracion/grupos/{id_grupo}/roles",
    response_model=RolesGrupoDTO,
)
async def actualizar_roles_grupo(
    id_grupo: int,
    datos: AsignarRolesDTO,
    usuario: Usuario = Depends(exigir_permiso("grupos.gestionar")),
):
    try:
        return await ServicioGestionGrupos.asignar_roles_grupo(
            id_grupo=id_grupo,
            ids_roles=datos.ids_roles,
            usuario_actor=usuario,
        )
    except LookupError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
