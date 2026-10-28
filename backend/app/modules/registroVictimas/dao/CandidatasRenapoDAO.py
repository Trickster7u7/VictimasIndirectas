from app.modules.descargarRegistros.dao.RegistroVictimasDAO import (
    RegistroVictimasDAO,
)
from app.core.validaciones.curp import PATRON_CURP

class CandidatasRenapoDAO:
    """Lee los registros SESNSP ya descargados; nunca consulta RENAPO."""

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
    ):
        # Los filtros compartidos NO incluyen las reglas de candidatas.
        consulta = RegistroVictimasDAO.construir_consulta_historico(
            curp=curp,
            nombre=nombre,
            edad=edad,
            fecha_hechos=fecha_hechos,
            entidad=entidad,
            numero_carpeta=numero_carpeta,
            mes=mes,
            anio=anio,
        )

        # Reglas obligatorias exclusivas de Registro de víctimas:
        # edad mayor a 10 y CURP con algún caracter no blanco.
        # Filtros exclusivos del módulo Registro de víctimas
        consulta = consulta.filter(
            edad__gt=10,
            curp__posix_regex=PATRON_CURP,
        )

        return await RegistroVictimasDAO.paginar_consulta(
            consulta=consulta,
            pagina=pagina,
            limite=limite,
        )
