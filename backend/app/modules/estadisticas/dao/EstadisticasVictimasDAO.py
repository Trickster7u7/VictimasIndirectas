from tortoise.expressions import Q

from app.modules.descargarRegistros.models.RegistroVictimasModel import (
    RegistroVictimaDescargado,
)
from app.modules.descargarRegistros.models.DescargaVictimasModel import DescargaVictimas

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

    @staticmethod
    async def consultar_periodos_agregados() -> list[dict]:
        # No consultar filas individuales: ni nombres, CURP, domicilios,
        # carpetas de investigación ni datos SSPC completos.
        return await DescargaVictimas.filter(
            origen="API_SSPC",
            estado="completado",
            verificado_api=True,
        ).order_by("-anio", "-mes").limit(36).values(
            "anio", "mes", "cantidad_registros"
        )
    @staticmethod
    async def consultar_rango_periodos() -> tuple[str | None, str | None]:
        """
        Obtiene el primer y último periodo disponible
        de las descargas verificadas del SESNSP.

        No consulta información personal de las víctimas.
        """

        consulta = DescargaVictimas.filter(
            origen="API_SSPC",
            estado="completado",
            verificado_api=True,
            cantidad_registros__gt=0,
        )

        primer_periodo = await consulta.order_by(
            "anio",
            "mes",
        ).first()

        ultimo_periodo = await consulta.order_by(
            "-anio",
            "-mes",
        ).first()

        if primer_periodo is None or ultimo_periodo is None:
            return None, None

        periodo_inicio = (
            f"{primer_periodo.anio}-{primer_periodo.mes:02d}"
        )

        periodo_fin = (
            f"{ultimo_periodo.anio}-{ultimo_periodo.mes:02d}"
        )

        return periodo_inicio, periodo_fin
