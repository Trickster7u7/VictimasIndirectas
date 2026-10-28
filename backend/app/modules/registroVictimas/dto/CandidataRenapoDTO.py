from app.modules.descargarRegistros.dto.RegistroVictimasHistoricoDTO import (
    RegistroHistoricoDTO,
    RespuestaHistoricoDTO,
)


class CandidataRenapoDTO(RegistroHistoricoDTO):
    """Fila de SESNSP que cumple los filtros; no implica parentesco confirmado."""


class RespuestaCandidatasRenapoDTO(RespuestaHistoricoDTO):
    registros: list[CandidataRenapoDTO]
