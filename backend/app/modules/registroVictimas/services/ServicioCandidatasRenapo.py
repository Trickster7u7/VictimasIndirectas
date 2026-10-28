from app.modules.descargarRegistros.services.ServicioConsultaRegistrosVictimas import (
    ServicioConsultaRegistrosVictimas,
)
from app.modules.registroVictimas.dao.CandidatasRenapoDAO import (
    CandidatasRenapoDAO,
)
from app.modules.registroVictimas.dto.CandidataRenapoDTO import (
    RespuestaCandidatasRenapoDTO,
)


class ServicioCandidatasRenapo:
    @staticmethod
    async def listar(
        pagina: int = 1,
        limite: int = 10,
        curp: str | None = None,
        nombre: str | None = None,
        edad: int | None = None,
        fecha_hechos: str | None = None,
        entidad: str | None = None,
        numero_carpeta: str | None = None,
        mes: int | None = None,
        anio: int | None = None,
    ) -> RespuestaCandidatasRenapoDTO:
        registros, total = await CandidatasRenapoDAO.listar(
            pagina=pagina,
            limite=limite,
            curp=curp,
            nombre=nombre,
            edad=edad,
            fecha_hechos=fecha_hechos,
            entidad=entidad,
            numero_carpeta=numero_carpeta,
            mes=mes,
            anio=anio,
        )

        # Mantiene el contrato JSON consumido actualmente por React.
        respuesta = ServicioConsultaRegistrosVictimas.construir_respuesta(
            registros=registros,
            total=total,
            pagina=pagina,
            limite=limite,
        )
        return RespuestaCandidatasRenapoDTO.model_validate(respuesta.model_dump())
