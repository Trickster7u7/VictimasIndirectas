
from app.modules.descargarRegistros.models.RegistroVictimasModel import (
    RegistroVictimaDescargado,
)
from tortoise.expressions import Q

class RegistroVictimasDAO:

    @staticmethod
    async def insertar_si_no_existe(
        descarga_id: int,
        hash_contenido: str,
        ocurrencia: int,
        campos: dict,
        datos_originales: dict,
        conexion,
    ):
        registro, creado = (
            await RegistroVictimaDescargado.get_or_create(
                descarga_id=descarga_id,
                hash_contenido=hash_contenido,
                ocurrencia=ocurrencia,
                defaults={
                    **campos,
                    "datos_sspc": datos_originales,
                },
                using_db=conexion,
            )
        )

        return registro, creado

    @staticmethod
    async def contar_por_descarga(
        descarga_id: int,
        conexion,
    ) -> int:
        return await (
            RegistroVictimaDescargado.filter(
                descarga_id=descarga_id
            )
            .using_db(conexion)
            .count()
        )
    
    
    @staticmethod
    def construir_consulta_historico(
        curp: str | None = None,
        nombre: str | None = None,
        fecha_hechos: str | None = None,
        edad: int | None = None,
        entidad: str | None = None,
        numero_carpeta: str | None = None,
        mes: int | None = None,
        anio: int | None = None,
    ):
        """Base compartida de lectura: solo descargas SESNSP verificadas."""
        consulta = RegistroVictimaDescargado.filter(
            descarga__origen="API_SSPC",
            descarga__estado="completado",
            descarga__verificado_api=True,
        )

        if curp:
            consulta = consulta.filter(
                curp__icontains=curp
            )

        if nombre:
            for palabra in nombre.split():
                consulta = consulta.filter(
                    Q(nombre__icontains=palabra)
                    | Q(primer_apellido__icontains=palabra)
                    | Q(segundo_apellido__icontains=palabra)
                )

        if fecha_hechos:
            consulta = consulta.filter(
                fecha_hechos__icontains=fecha_hechos
            )

        if edad is not None:
            consulta = consulta.filter(edad=edad)

        if entidad:
            consulta = consulta.filter(
                entidad_hechos__icontains=entidad
            )

        if numero_carpeta:
            consulta = consulta.filter(
                numero_carpeta__icontains=numero_carpeta
            )

        if mes is not None:
            consulta = consulta.filter(
                descarga__mes=mes
            )

        if anio is not None:
            consulta = consulta.filter(
                descarga__anio=anio
            )

        return consulta

    @staticmethod
    async def paginar_consulta(consulta, pagina: int, limite: int):
        total = await consulta.count()

        registros = await (
            consulta
            .select_related("descarga")
            .order_by(
                "-descarga__anio",
                "-descarga__mes",
                "-id",
            )
            .offset((pagina - 1) * limite)
            .limit(limite)
        )

        return registros, total

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
    ):
        consulta = RegistroVictimasDAO.construir_consulta_historico(
            curp=curp,
            nombre=nombre,
            fecha_hechos=fecha_hechos,
            edad=edad,
            entidad=entidad,
            numero_carpeta=numero_carpeta,
            mes=mes,
            anio=anio,
        )
        return await RegistroVictimasDAO.paginar_consulta(consulta, pagina, limite)
    
    @staticmethod
    async def obtener_por_id(id_registro: int):
        return await (
            RegistroVictimaDescargado
            .filter(id=id_registro)
            .select_related("descarga")
            .first()
        )


