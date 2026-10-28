
from datetime import datetime, timezone

from app.modules.descargarRegistros.models.DescargaVictimasModel import (
    DescargaVictimas,
)


class DescargaVictimasDAO:

    @staticmethod
    async def obtener_o_crear(
        anio: int,
        mes: int,
        origen: str,
        conexion,
    ):
        return await DescargaVictimas.get_or_create(
            anio=anio,
            mes=mes,
            defaults={
                "origen": origen,
                "estado": "pendiente",
            },
            using_db=conexion,
        )

    @staticmethod
    async def marcar_completada(
        descarga_id: int,
        origen: str,
        total: int,
        conexion,
    ):
        await DescargaVictimas.filter(
            id=descarga_id
        ).using_db(conexion).update(
            origen=origen,
            estado="completado",
            cantidad_registros=total,
            verificado_api=(origen == "API_SSPC"),
            fecha_descarga=datetime.now(timezone.utc),
        )
