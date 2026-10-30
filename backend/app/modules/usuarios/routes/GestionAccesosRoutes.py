from fastapi import APIRouter, Depends, HTTPException, Query, Response
from tortoise.exceptions import IntegrityError

from app.modules.usuarios.dependencias.DependenciasAutenticacion import (
    obtener_usuario_activo,
)
from app.modules.usuarios.dependencias.DependenciasPermisos import exigir_permiso
from app.modules.usuarios.dto.AccesosDTO import (
    AprobarUsuarioDTO,
    AsignarRolesDTO,
    AsignarGruposDTO,
    CrearGrupoDTO,
    GrupoDTO,
    GruposUsuarioDTO,
    AsignarPermisosRolDTO,
    PaginaUsuariosDTO,
    PermisoDTO,
    PermisosRolDTO,
    RolDTO,
    RolesGrupoDTO,
    RolesUsuarioDTO,
    UsuarioAprobadoDTO,
)
from app.modules.usuarios.models.UsuarioModel import Usuario
from app.modules.usuarios.models.UsuarioRolModel import UsuarioRol
from app.modules.usuarios.models.catalogos.EstatusUsuarioModel import EstadoUsuario
from app.modules.usuarios.services.ServicioAutorizacion import ServicioAutorizacion
from app.modules.usuarios.services.ServicioAdministracionUsuarios import (
    ServicioAdministracionUsuarios,
)
from app.modules.usuarios.services.ServicioGestionAccesos import ServicioGestionAccesos
from app.modules.usuarios.services.ServicioGestionGrupos import ServicioGestionGrupos
from app.modules.usuarios.services.ServicioPermisosRol import ServicioPermisosRol
from app.modules.usuarios.services.ServicioValidacionUsuario import ServicioValidacionUsuario


router = APIRouter(prefix="/api/usuarios", tags=["Gestión de accesos"])


async def exigir_administrador_directo(
    usuario: Usuario = Depends(obtener_usuario_activo),
) -> Usuario:
    """La edición del catálogo no se delega a otros roles."""
    if not await UsuarioRol.filter(
        usuario_id=usuario.id,
        rol__codigo="ADMINISTRADOR",
        rol__activo=True,
    ).exists():
        raise HTTPException(status_code=403, detail="Se requiere ADMINISTRADOR.")
    return usuario


@router.get("/mis-permisos", response_model=list[str])
async def consultar_mis_permisos(
    usuario: Usuario = Depends(obtener_usuario_activo),
):
    return sorted(await ServicioAutorizacion.obtener_permisos(usuario))


@router.post(
    "/administracion/usuarios/{id_usuario}/aprobar",
    response_model=UsuarioAprobadoDTO,
)
async def aprobar_usuario(
    id_usuario: int,
    datos: AprobarUsuarioDTO,
    usuario_actor: Usuario = Depends(exigir_permiso("usuarios.validar")),
):
    if id_usuario == usuario_actor.id:
        raise HTTPException(
            status_code=400, detail="No puedes aprobar tu propia cuenta."
        )

    try:
        aprobado = await ServicioValidacionUsuario().aprobar_usuario(
            id_usuario=id_usuario,
            usuario_validador=usuario_actor,
            observaciones=datos.observaciones,
        )
    except LookupError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return UsuarioAprobadoDTO(
        id_usuario=aprobado.id,
        estado=aprobado.estado.value if hasattr(aprobado.estado, "value") else aprobado.estado,
    )


@router.post(
    "/administracion/usuarios/{id_usuario}/rechazar",
    response_model=UsuarioAprobadoDTO,
)
async def rechazar_usuario(
    id_usuario: int,
    datos: AprobarUsuarioDTO,
    usuario_actor: Usuario = Depends(exigir_permiso("usuarios.validar")),
):
    if id_usuario == usuario_actor.id:
        raise HTTPException(status_code=400, detail="No puedes rechazar tu propia cuenta.")
    try:
        rechazado = await ServicioValidacionUsuario().rechazar_usuario(
            id_usuario=id_usuario,
            usuario_validador=usuario_actor,
            observaciones=datos.observaciones or "",
        )
    except LookupError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    return UsuarioAprobadoDTO(id_usuario=rechazado.id, estado=str(rechazado.estado))


@router.get("/administracion/usuarios", response_model=PaginaUsuariosDTO)
async def listar_usuarios_administracion(
    response: Response,
    buscar: str = Query("", max_length=80),
    estado: EstadoUsuario | None = None,
    pagina: int = Query(1, ge=1),
    limite: int = Query(20, ge=1, le=100),
    _administrador: Usuario = Depends(exigir_administrador_directo),
):
    response.headers["Cache-Control"] = "private, no-store"
    return await ServicioAdministracionUsuarios.listar(
        buscar=buscar.strip(), estado=estado, pagina=pagina, limite=limite
    )


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
    "/administracion/roles/{id_rol}/permisos",
    response_model=PermisosRolDTO,
)
async def consultar_permisos_rol(
    id_rol: int,
    _administrador: Usuario = Depends(exigir_administrador_directo),
):
    try:
        return await ServicioPermisosRol.consultar(id_rol)
    except LookupError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.put(
    "/administracion/roles/{id_rol}/permisos",
    response_model=PermisosRolDTO,
)
async def actualizar_permisos_rol(
    id_rol: int,
    datos: AsignarPermisosRolDTO,
    administrador: Usuario = Depends(exigir_administrador_directo),
):
    try:
        return await ServicioPermisosRol.guardar(
            id_rol=id_rol,
            ids_permisos=datos.ids_permisos,
            usuario_actor=administrador,
        )
    except LookupError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


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
