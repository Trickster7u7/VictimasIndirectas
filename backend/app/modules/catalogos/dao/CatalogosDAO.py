from app.modules.catalogos.models.EntidadModel import Entidad


class CatalogosDAO:
    """Consultas a los catálogos almacenados en PostgreSQL."""

    @staticmethod
    async def obtener_entidades() -> list[dict]:

        return await Entidad.filter(
            activo=True
        ).order_by("nombre").values(
            "id",
            "clave",
            "nombre"
        )