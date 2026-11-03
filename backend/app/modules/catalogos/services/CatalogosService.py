from app.modules.catalogos.dao.CatalogosDAO import CatalogosDAO


class CatalogosService:
    """Lógica de negocio de los catálogos."""

    @staticmethod
    async def listar_entidades() -> list[dict]:

        return await CatalogosDAO.obtener_entidades()