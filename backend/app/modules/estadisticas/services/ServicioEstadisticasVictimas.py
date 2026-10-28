from datetime import datetime
from zoneinfo import ZoneInfo

from app.modules.estadisticas.dao.EstadisticasVictimasDAO import (
    EstadisticasVictimasDAO,
)
from app.modules.estadisticas.dto.EstadisticasVictimasDTO import (
    EstadisticasVictimasDTO,
)


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
