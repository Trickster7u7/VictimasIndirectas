from tortoise.expressions import Q

from app.modules.descargarRegistros.models.RegistroVictimasModel import (
    RegistroVictimaDescargado,
)

from app.core.validaciones.curp import PATRON_CURP


class EstadisticasVictimasDAO:
    """Consultas agregadas de víctimas en PostgreSQL."""

    @staticmethod
    async def consultar_conteos() -> tuple[int, int, int]:

        # Registros descargados y verificados de SESNSP
        consulta = RegistroVictimaDescargado.filter(
            descarga__origen="API_SSPC",
            descarga__estado="completado",
            descarga__verificado_api=True,
        )

        # 1. Total de víctimas
        total = await consulta.count()

        # 2. Víctimas menores de 18 años
        menores = await consulta.filter(
            edad__gte=0,
            edad__lt=18,
        ).count()

        # 3. Registros sin CURP o con formato incorrecto
        curps_invalidas = await consulta.filter(
            Q(curp__isnull=True)
            | ~Q(curp__posix_regex=PATRON_CURP)
        ).count()

        return total, menores, curps_invalidas