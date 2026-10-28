from app.modules.descargarRegistros.dao.RegistroVictimasDAO import RegistroVictimasDAO
from app.modules.descargarRegistros.dto.RegistroVictimasHistoricoDTO import (
    RegistroHistoricoDTO,
    RegistroVictimaDetalleDTO,
    RespuestaHistoricoDTO,
)
from app.modules.descargarRegistros.services.ServicioDescargaVictimas import CAMPOS_SSPC


class ServicioConsultaRegistrosVictimas:
    @staticmethod
    async def obtener_historico(
        pagina: int = 1,
        limite: int = 10,
        curp: str | None = None,
        nombre: str | None = None,
        fecha_hechos: str | None = None,
        edad: int | None = None,
        entidad: str | None = None,
        numero_carpeta: str | None = None,
        mes: int | None = None,
        anio: int | None = None,
    ) -> RespuestaHistoricoDTO:
        registros, total = await RegistroVictimasDAO.obtener_historico(
            pagina=pagina,
            limite=limite,
            curp=curp,
            nombre=nombre,
            fecha_hechos=fecha_hechos,
            edad=edad,
            entidad=entidad,
            numero_carpeta=numero_carpeta,
            mes=mes,
            anio=anio,
        )

        return ServicioConsultaRegistrosVictimas.construir_respuesta(
            registros=registros,
            total=total,
            pagina=pagina,
            limite=limite,
        )

    @staticmethod
    def construir_respuesta(
        registros, total: int, pagina: int, limite: int
    ) -> RespuestaHistoricoDTO:
        """Serializador único usado por el histórico y la lista de candidatas."""
        resultados = []
        for registro in registros:
            descarga = registro.descarga
            nombre_completo = " ".join(
                parte.strip()
                for parte in (
                    registro.nombre,
                    registro.primer_apellido,
                    registro.segundo_apellido,
                )
                if parte and parte.strip()
            ) or "SIN DATO"

            resultados.append(
                RegistroHistoricoDTO(
                    id_registro=registro.id,
                    mes=descarga.mes,
                    anio=descarga.anio,
                    origen=descarga.origen,
                    estado_descarga=descarga.estado,
                    verificado_api=descarga.verificado_api,
                    fecha_descarga=descarga.fecha_descarga,
                    curp=registro.curp,
                    nombre_completo=nombre_completo,
                    edad=registro.edad,
                    fecha_hechos=registro.fecha_hechos,
                    entidad_hechos=registro.entidad_hechos,
                    numero_carpeta=registro.numero_carpeta,
                )
            )

        return RespuestaHistoricoDTO(
            pagina=pagina,
            limite=limite,
            total=total,
            paginas=(total + limite - 1) // limite,
            registros=resultados,
        )

    @staticmethod
    async def obtener_detalle(id_registro: int) -> RegistroVictimaDetalleDTO | None:
        registro = await RegistroVictimasDAO.obtener_por_id(id_registro)
        if registro is None:
            return None

        campos = {
            campo_sspc: getattr(registro, campo_bd)
            for campo_sspc, campo_bd in CAMPOS_SSPC.items()
        }
        return RegistroVictimaDetalleDTO(
            id_registro=registro.id,
            mes=registro.descarga.mes,
            anio=registro.descarga.anio,
            origen=registro.descarga.origen,
            campos=campos,
        )
