
import json
from pathlib import Path

from app.modules.registrosVictimas.dto.PeriodoConsultaVictimasDTO import (
    PeriodoConsultaVictimasDTO,
)


class ProveedorRegistroVictimasMock:

    @staticmethod
    async def consultar_registros(
        periodo: PeriodoConsultaVictimasDTO,
    ) -> list[dict]:

        # El archivo corresponde a septiembre de 2026
        if periodo.mes != 9 or periodo.anio != 2026:
            return []

        ruta_json = (
            Path(__file__).resolve().parent.parent
            / "mocks"
            / "registros_victimas_2026_09.json"
        )

        with ruta_json.open(
            "r",
            encoding="utf-8"
        ) as archivo:
            registros = json.load(archivo)

        if not isinstance(registros, list):
            raise ValueError("Formato JSON incorrecto")

        return registros
