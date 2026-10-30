from app.core.configuracion import configuracion


CONFIGURACION_TORTOISE = {
    "connections": {
        "default": configuracion.url_base_datos,
    },
    "apps": {
        "modelos": {
            "models": [
                # Usuarios y autenticación
                "app.modules.usuarios.models.UsuarioModel",
                "app.modules.usuarios.models.PerfilInstitucionalModel",
                "app.modules.usuarios.models.IdentidadLlaveMxModel",
                "app.modules.usuarios.models.SesionUsuarioModel",

                # Tablas persistentes de descargas SSPC (sin alterar el esquema).
                "app.modules.descargarRegistros.models.DescargaVictimasModel",
                "app.modules.descargarRegistros.models.RegistroVictimasModel",
    
                # =====================================
                # GESTIÓN DE USUARIOS, GRUPOS Y ROLES
                # =====================================

                # Roles y permisos
                "app.modules.usuarios.models.RolModel",
                "app.modules.usuarios.models.PermisoModel",
                "app.modules.usuarios.models.RolPermisoModel",
                "app.modules.usuarios.models.UsuarioRolModel",

                # Grupos
                "app.modules.usuarios.models.GrupoModel",
                "app.modules.usuarios.models.UsuarioGrupoModel",
                "app.modules.usuarios.models.GrupoRolModel",

                # Auditoría
                "app.modules.usuarios.models.AuditoriaRolesModel",
                "app.modules.usuarios.models.AuditoriaGruposModel",
                "app.modules.usuarios.models.AuditoriaPermisosRolModel",
            ],
            "default_connection": "default",
            "migrations": "app.modules.usuarios.migrations",
        },
    },
    "use_tz": True,
    "timezone": "UTC",
}
