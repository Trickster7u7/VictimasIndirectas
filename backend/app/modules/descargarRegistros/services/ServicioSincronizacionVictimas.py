from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from app.modules.descargarRegistros.providers.ProveedorSSPC import (
    proveedor_sspc,
)

from app.modules.descargarRegistros.services.ServicioDescargaVictimas import (
    ServicioDescargaVictimas,
)

from app.modules.descargarRegistros.services.sincronizacion import (
    obtener_periodo_anterior,
)

from app.modules.descargarRegistros.models.DescargaVictimasModel import (
    DescargaVictimas,
)


class ServicioSincronizacionVictimas:

    FECHA_INICIO = date(2026, 1, 1)
    ZONA_HORARIA = ZoneInfo("America/Mexico_City")

    @classmethod
    def ultimo_periodo_elegible(cls) -> date:
        """Solo son elegibles meses cerrados a partir del día 5 siguiente."""
        hoy = datetime.now(cls.ZONA_HORARIA).date()
        primero_actual = hoy.replace(day=1)
        ultimo_anterior = primero_actual - timedelta(days=1)
        if hoy.day >= 5:
            return ultimo_anterior.replace(day=1)
        ultimo_anteanterior = ultimo_anterior.replace(day=1) - timedelta(days=1)
        return ultimo_anteanterior.replace(day=1)

    @classmethod
    async def obtener_estado_mensual(cls, usuario_autorizado: bool) -> dict:
        hoy = datetime.now(cls.ZONA_HORARIA).date()
        limite = cls.ultimo_periodo_elegible()
        descargas = await DescargaVictimas.filter(
            anio__gte=cls.FECHA_INICIO.year,
        ).all()
        por_periodo = {(item.anio, item.mes): item for item in descargas}

        periodos = []
        actual = cls.FECHA_INICIO
        while actual <= hoy.replace(day=1):
            descarga = por_periodo.get((actual.year, actual.month))
            elegible = actual <= limite

            if descarga and descarga.origen != "API_SSPC":
                estado = "requiere_revision"
            elif descarga and descarga.estado == "completado" and descarga.verificado_api:
                estado = "completado"
            elif descarga and descarga.estado == "en_proceso":
                estado = "en_proceso"
            elif descarga and descarga.estado == "error":
                estado = "error"
            else:
                estado = "pendiente" if elegible else "programado"

            periodos.append({
                "anio": actual.year,
                "mes": actual.month,
                "estado": estado,
                "elegible": elegible,
                "origen": descarga.origen if descarga else None,
                "verificado_api": descarga.verificado_api if descarga else False,
                "cantidad_registros": descarga.cantidad_registros if descarga else 0,
                "fecha_descarga": descarga.fecha_descarga if descarga else None,
            })

            actual = (actual.replace(day=28) + timedelta(days=4)).replace(day=1)

        completados = sum(periodo["estado"] == "completado" for periodo in periodos)
        pendientes = sum(periodo["estado"] in {"pendiente", "error"} for periodo in periodos)
        revision = sum(periodo["estado"] == "requiere_revision" for periodo in periodos)
        fechas_exitosas = [
            periodo["fecha_descarga"] for periodo in periodos
            if periodo["estado"] == "completado" and periodo["fecha_descarga"]
        ]

        proximo_mes = (hoy.replace(day=28) + timedelta(days=4)).replace(day=1)
        siguiente_corte = hoy.replace(day=5) if hoy.day < 5 else proximo_mes.replace(day=5)
        return {
            "fecha_consulta": datetime.now(cls.ZONA_HORARIA).isoformat(),
            "proxima_ejecucion": datetime.combine(
                siguiente_corte, datetime.min.time(), cls.ZONA_HORARIA
            ).replace(hour=3).isoformat(),
            "puede_sincronizar": usuario_autorizado,
            "total_periodos": len(periodos),
            "completados": completados,
            "pendientes": pendientes,
            "requieren_revision": revision,
            "ultima_descarga": max(fechas_exitosas).isoformat() if fechas_exitosas else None,
            "periodos": periodos,
        }

    # ==========================================
    # 1. SINCRONIZAR UN PERIODO
    # ==========================================

    @staticmethod
    async def sincronizar_periodo(
        anio: int,
        mes: int,
    ) -> dict:

        if not 2000 <= anio <= 2100:
            raise ValueError("Año inválido.")

        if not 1 <= mes <= 12:
            raise ValueError("Mes inválido.")

        solicitado = date(anio, mes, 1)
        if solicitado < ServicioSincronizacionVictimas.FECHA_INICIO:
            raise ValueError("La sincronización inicia en enero de 2026.")
        if solicitado > ServicioSincronizacionVictimas.ultimo_periodo_elegible():
            raise ValueError("El periodo todavía no cumple la fecha de corte del día 5.")

        # ======================================
        # 2. OBTENER O CREAR CONTROL DE DESCARGA
        # ======================================

        descarga, _ = await DescargaVictimas.get_or_create(
            anio=anio,
            mes=mes,
            defaults={
                "origen": "API_SSPC",
                "estado": "pendiente",
                "verificado_api": False,
            },
        )

        # No mezclar datos locales con los de SESNSP.
        if descarga.origen != "API_SSPC":
            raise ValueError(
                "El periodo ya contiene una descarga "
                "de otro origen. Requiere revisión."
            )

        # ======================================
        # 3. EVITAR DESCARGAS REPETIDAS
        # ======================================

        if (
            descarga.estado == "completado"
            and descarga.verificado_api
        ):
            return {
                "estado": "sin_cambios",
                "mensaje": "El periodo ya fue descargado.",
                "anio": anio,
                "mes": mes,
                "total": descarga.cantidad_registros,
            }

        # Evitar modificar un periodo completado
        # que tenga un estado inconsistente.
        if descarga.estado == "completado":
            raise RuntimeError(
                "El periodo está completado pero "
                "no aparece verificado. Revisar."
            )

        # ======================================
        # 4. RESERVAR LA DESCARGA
        # ======================================

        # La actualización condicional impide
        # que dos procesos reclamen simultáneamente
        # un periodo pendiente o fallido.

        actualizados = await DescargaVictimas.filter(
            id=descarga.id,
            origen="API_SSPC",
            estado__in=["pendiente", "error"],
            verificado_api=False,
        ).update(
            estado="en_proceso",
        )

        if actualizados == 0:
            raise RuntimeError(
                "El periodo ya está en proceso "
                "o no puede sincronizarse."
            )

        # ======================================
        # 5. CONSULTAR SESNSP
        # ======================================

        try:

            registros = await proveedor_sspc.consultar_registros(
                anio=anio,
                mes=mes,
            )

            if not registros:
                raise ValueError(
                    "SESNSP no devolvió registros para "
                    "el periodo solicitado."
                )

            # ==================================
            # 6. GUARDAR EN POSTGRESQL
            # ==================================

            resultado = (
                await ServicioDescargaVictimas.importar_registros(
                    anio=anio,
                    mes=mes,
                    registros=registros,
                    origen="API_SSPC",
                )
            )

            # El servicio de importación marca
            # la descarga como completada dentro
            # de su propia transacción.

            return {
                "estado": "completado",
                "mensaje": "Sincronización exitosa.",
                **resultado,
            }

        # ======================================
        # 7. CONTROL DE ERRORES
        # ======================================

        except Exception:

            await DescargaVictimas.filter(
                id=descarga.id,
                estado="en_proceso",
            ).update(
                estado="error",
                verificado_api=False,
            )

            raise

    # ==========================================
    # 8. SINCRONIZAR EL MES ANTERIOR
    # ==========================================

    @staticmethod
    async def sincronizar_mes_anterior() -> dict:

        periodo = obtener_periodo_anterior()

        return await (
            ServicioSincronizacionVictimas.sincronizar_periodo(
                anio=periodo["anio"],
                mes=periodo["mes"],
            )
        )

