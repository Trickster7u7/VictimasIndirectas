from app.modules.descargarRegistros.dto.RegistroVictimasResumenDTO import (
    RegistroResumenDTO,
)

from app.modules.descargarRegistros.dto.PeriodoConsultaVictimasDTO import (
    PeriodoConsultaVictimasDTO,
)

from app.modules.descargarRegistros.models.RegistroVictimasModel import (
    RegistroVictimaDescargado,
)


class ServicioRegistroVictimas:

    @staticmethod
    async def consultar_por_periodo(
        periodo: PeriodoConsultaVictimasDTO,
    ) -> list[RegistroResumenDTO]:

        registros_bd = await (
            RegistroVictimaDescargado
            .filter(
                descarga__anio=periodo.anio,
                descarga__mes=periodo.mes,
                descarga__verificado_api=True,
                descarga__estado="completado",
            )
            .order_by("id")
        )

        resultados = []

        for registro in registros_bd:

            nombre_completo = " ".join(
                parte.strip()
                for parte in [
                    registro.nombre,
                    registro.primer_apellido,
                    registro.segundo_apellido,
                ]
                if parte and parte.strip()
            ) or "Sin identificar"

            resultados.append(
                RegistroResumenDTO(
                    id_registro=str(registro.id),
                    curp=registro.curp,
                    nombre_completo=nombre_completo,
                    edad=registro.edad,
                    fecha_hechos=registro.fecha_hechos,
                    entidad_hechos=registro.entidad_hechos,
                    numero_carpeta=registro.numero_carpeta,
                    numero_nna_relacionados=None,
                    estado_consulta_nna="pendiente",
                )
            )

        return resultados