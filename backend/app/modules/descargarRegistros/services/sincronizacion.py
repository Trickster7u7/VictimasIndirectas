from datetime import datetime, timedelta
from zoneinfo import ZoneInfo


ZONA_HORARIA = ZoneInfo("America/Mexico_City")


def obtener_periodo_anterior():
    hoy = datetime.now(ZONA_HORARIA).date()

    primer_dia_mes = hoy.replace(day=1)

    ultimo_dia_mes_anterior = (
        primer_dia_mes - timedelta(days=1)
    )

    return {
        "mes": ultimo_dia_mes_anterior.month,
        "anio": ultimo_dia_mes_anterior.year,
    }