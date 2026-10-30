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
    "registros.detalle.consultar": ("Registros", "Consultar detalle completo de registros"),
    "registros.sincronizar": ("Registros", "Sincronizar registros externos"),
    "registros.exportar": ("Registros", "Exportar registros"),
    "registros.resumen.consultar": ("Registros", "Consultar tabla agregada por periodo"),
    "estadisticas.consultar": ("Estadísticas", "Consultar indicadores agregados"),
    "victimas.consultar": ("Víctimas", "Consultar información de víctimas"),
    "victimas.gestionar": ("Víctimas", "Gestionar información de víctimas"),
}

ROLES = {
    "ADMINISTRADOR": {
        "nombre": "Administrador",
        "permisos": tuple(PERMISOS),
    },
    "OPERADOR": {
        "nombre": "Operador",
        "permisos": (
            "registros.consultar", "registros.detalle.consultar",
            "registros.exportar", "registros.sincronizar",
            "registros.resumen.consultar",
            "victimas.consultar", "victimas.gestionar",
            "estadisticas.consultar",
        ),
    },
    "CONSULTA": {
        "nombre": "Consulta",
        "permisos": (
            "estadisticas.consultar", "registros.resumen.consultar",
            "registros.consultar", "victimas.consultar",
        ),
    },
}
