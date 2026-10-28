"""Catálogo inicial. No se aplica automáticamente al iniciar la API."""

PERMISOS = {
    "usuarios.consultar": ("Usuarios", "Consultar usuarios"),
    "usuarios.validar": ("Usuarios", "Aprobar o rechazar usuarios"),
    "usuarios.asignar_roles": ("Usuarios", "Asignar y retirar roles"),
    "usuarios.asignar_grupos": ("Usuarios", "Asignar y retirar usuarios de grupos"),
    "roles.consultar": ("Usuarios", "Consultar catálogo de roles y permisos"),
    "grupos.consultar": ("Usuarios", "Consultar grupos y su configuración"),
    "grupos.gestionar": ("Usuarios", "Crear grupos y asignarles roles"),
    "registros.consultar": ("Registros", "Consultar registros de víctimas"),
    "registros.sincronizar": ("Registros", "Sincronizar registros externos"),
    "registros.exportar": ("Registros", "Exportar registros"),
    "victimas.consultar": ("Víctimas", "Consultar información de víctimas"),
    "victimas.gestionar": ("Víctimas", "Gestionar información de víctimas"),
}

ROLES = {
    "ADMINISTRADOR": {
        "nombre": "Administrador",
        "permisos": tuple(PERMISOS),
    },
    "VALIDADOR": {
        "nombre": "Validador institucional",
        "permisos": (
            "usuarios.consultar", "usuarios.validar",
            "registros.consultar", "victimas.consultar",
        ),
    },
    "CAPTURISTA": {
        "nombre": "Capturista",
        "permisos": (
            "registros.consultar", "victimas.consultar", "victimas.gestionar",
        ),
    },
    "CONSULTA": {
        "nombre": "Consulta",
        "permisos": ("registros.consultar", "victimas.consultar"),
    },
}
