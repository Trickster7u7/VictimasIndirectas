
import hashlib
import json

from collections import defaultdict

from tortoise.transactions import in_transaction

from app.modules.descargarRegistros.dao.DescargaVictimasDAO import (
    DescargaVictimasDAO,
)
from app.modules.descargarRegistros.dao.RegistroVictimasDAO import (
    RegistroVictimasDAO,
)


# Campo recibido de SESNSP: columna de PostgreSQL
CAMPOS_SSPC = {
    "IdentificadorVictima": "identificador_victima",
    "Nombre": "nombre",
    "PrimerApellido": "primer_apellido",
    "SegundoApellido": "segundo_apellido",
    "CURP": "curp",
    "TipoVictima": "tipo_victima",
    "TipoPersonaMoral": "tipo_persona_moral",
    "Sexo": "sexo",
    "Genero": "genero",
    "PoblacionIndigena": "poblacion_indigena",
    "Discapacidad": "discapacidad",
    "FechaNacimiento": "fecha_nacimiento",
    "Edad": "edad",
    "Nacionalidad": "nacionalidad",
    "EntidadReportante": "entidad_reportante",
    "UsuarioReportante": "usuario_reportante",
    "AnioCorte": "anio_corte",
    "MesCorte": "mes_corte",
    "IdentificadorCarpeta": "identificador_carpeta",
    "NumeroCarpeta": "numero_carpeta",
    "FechaInicioCarpeta": "fecha_inicio_carpeta",
    "HoraInicioCarpeta": "hora_inicio_carpeta",
    "ResumenHechos": "resumen_hechos",
    "IdentificadorDelito": "identificador_delito",
    "DelitoFiscalia": "delito_fiscalia",
    "ModalidadFiscalia": "modalidad_fiscalia",
    "BienJuridico": "bien_juridico",
    "DelitoCatalogo": "delito_catalogo",
    "SubtipoDelito": "subtipo_delito",
    "ModalidadCatalogo": "modalidad_catalogo",
    "FormaAccion": "forma_accion",
    "InstrumentoComision": "instrumento_comision",
    "GradoConsumacion": "grado_consumacion",
    "FechaHechos": "fecha_hechos",
    "HoraHechos": "hora_hechos",
    "BienJuridicoSabana": "bien_juridico_sabana",
    "DelitoSabana": "delito_sabana",
    "SubtipoDelitoSabana": "subtipo_delito_sabana",
    "ModalidadDelitoSabana": "modalidad_delito_sabana",
    "EntidadHechos": "entidad_hechos",
    "MunicipioHechos": "municipio_hechos",
    "LocalidadHechos": "localidad_hechos",
    "ColoniaHechos": "colonia_hechos",
    "CodigoPostal": "codigo_postal",
    "DomicilioHechos": "domicilio_hechos",
    "CoordenadaX": "coordenada_x",
    "CoordenadaY": "coordenada_y",
    "FechaRegistro": "fecha_registro",
}


def normalizar_valor(valor):
    if valor is None:
        return None

    if isinstance(valor, str):
        valor = valor.strip()

        if valor.upper() in ("", "NULL", "SIN DATO"):
            return None

    return valor


def convertir_entero(valor):
    valor = normalizar_valor(valor)

    if valor is None:
        return None

    if isinstance(valor, bool):
        raise ValueError("Valor booleano en campo entero")

    if isinstance(valor, int):
        return valor

    if isinstance(valor, str):
        try:
            return int(valor)
        except ValueError:
            raise ValueError(
                "Se encontró un valor entero inválido"
            ) from None

    raise ValueError("Tipo inválido en campo entero")


def mapear_registro(registro: dict) -> dict:
    campos = {}

    for origen, destino in CAMPOS_SSPC.items():

        valor = normalizar_valor(
            registro.get(origen)
        )

        if destino in ("edad", "anio_corte"):
            valor = convertir_entero(valor)

        elif valor is not None:
            if isinstance(valor, (dict, list)):
                raise ValueError(
                    f"Tipo inválido para el campo {origen}"
                )

            valor = str(valor)

        campos[destino] = valor

    return campos


def calcular_hash(campos: dict) -> str:
    contenido = json.dumps(
        campos,
        sort_keys=True,
        ensure_ascii=False,
        separators=(",", ":"),
    )

    return hashlib.sha256(
        contenido.encode("utf-8")
    ).hexdigest()


class ServicioDescargaVictimas:

    @staticmethod
    async def importar_registros(
        anio: int,
        mes: int,
        registros: list[dict],
        origen: str = "JSON_LOCAL",
    ) -> dict:

        if not 2000 <= anio <= 2100:
            raise ValueError("Año fuera de rango")

        if not 1 <= mes <= 12:
            raise ValueError("Mes fuera de rango")

        if origen not in ("JSON_LOCAL", "API_SSPC"):
            raise ValueError("Origen desconocido")

        if not isinstance(registros, list) or not registros:
            raise ValueError(
                "Se esperaba una lista no vacía"
            )

        # Validar y preparar antes de insertar
        preparados = []
        ocurrencias = defaultdict(int)

        for registro in registros:

            if not isinstance(registro, dict):
                raise ValueError(
                    "Todos los registros deben ser objetos JSON"
                )

            campos = mapear_registro(registro)
            hash_contenido = calcular_hash(campos)

            ocurrencias[hash_contenido] += 1

            preparados.append({
                "campos": campos,
                "hash": hash_contenido,
                "ocurrencia": ocurrencias[hash_contenido],
                "original": registro,
            })

        nuevos = 0

        # Una sola transacción para el periodo
        async with in_transaction("default") as conexion:

            descarga, _ = (
                await DescargaVictimasDAO.obtener_o_crear(
                    anio=anio,
                    mes=mes,
                    origen=origen,
                    conexion=conexion,
                )
            )

            if descarga.verificado_api and origen == "JSON_LOCAL":
                raise ValueError(
                    "No se permite reemplazar una descarga "
                    "real de SESNSP con datos locales."
                )

            for item in preparados:

                _, creado = (
                    await RegistroVictimasDAO.insertar_si_no_existe(
                        descarga_id=descarga.id,
                        hash_contenido=item["hash"],
                        ocurrencia=item["ocurrencia"],
                        campos=item["campos"],
                        datos_originales=item["original"],
                        conexion=conexion,
                    )
                )

                if creado:
                    nuevos += 1

            total = (
                await RegistroVictimasDAO.contar_por_descarga(
                    descarga_id=descarga.id,
                    conexion=conexion,
                )
            )

            await DescargaVictimasDAO.marcar_completada(
                descarga_id=descarga.id,
                origen=origen,
                total=total,
                conexion=conexion,
            )

            id_descarga = descarga.id

        return {
            "descarga_id": id_descarga,
            "anio": anio,
            "mes": mes,
            "origen": origen,
            "recibidos": len(registros),
            "nuevos": nuevos,
            "existentes": len(registros) - nuevos,
            "total_guardados": total,
        }
