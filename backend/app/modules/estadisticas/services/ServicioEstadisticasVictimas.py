from datetime import datetime
from zoneinfo import ZoneInfo

from app.modules.estadisticas.dao.EstadisticasVictimasDAO import (
    EstadisticasVictimasDAO,
)
from app.modules.estadisticas.dto.EstadisticasVictimasDTO import (
    EstadisticasVictimasDTO,
)
from app.modules.estadisticas.dto.ResumenPeriodosDTO import ResumenPeriodoDTO


class ServicioEstadisticasVictimas:
    ZONA_HORARIA = ZoneInfo("America/Mexico_City")

    @classmethod
    async def consultar_resumen(cls) -> EstadisticasVictimasDTO:

        total, menores, curps_invalidas = (
            await EstadisticasVictimasDAO.consultar_conteos()
        )

        return EstadisticasVictimasDTO(
            total_victimas=total,
            victimas_menores_18=menores,
            registros_curp_invalida=curps_invalidas,
            fecha_consulta=datetime.now(cls.ZONA_HORARIA),
        )

    @staticmethod
    async def consultar_registros_por_periodo() -> list[ResumenPeriodoDTO]:
        filas = await EstadisticasVictimasDAO.consultar_periodos_agregados()
        return [
            ResumenPeriodoDTO(
                anio=fila["anio"],
                mes=fila["mes"],
                total_registros=fila["cantidad_registros"],
            )
            for fila in filas
        ]
