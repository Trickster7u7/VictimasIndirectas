
from tortoise import fields, models


class RegistroVictimaDescargado(models.Model):

    # ========================================
    # CONTROL INTERNO DEL SISTEMA
    # ========================================

    id = fields.IntField(pk=True)

    descarga = fields.ForeignKeyField(
        "modelos.DescargaVictimas",
        related_name="registros",
        on_delete=fields.RESTRICT,
    )

    hash_contenido = fields.CharField(
        max_length=64,
        db_index=True,
    )

    ocurrencia = fields.IntField(default=1)

    # ========================================
    # CAMPOS SESNSP 1 - 16
    # DATOS DE IDENTIFICACIÓN
    # ========================================

    identificador_victima = fields.CharField(
        max_length=200, null=True, db_index=True
    )

    nombre = fields.CharField(max_length=200, null=True)
    primer_apellido = fields.CharField(max_length=200, null=True)
    segundo_apellido = fields.CharField(max_length=200, null=True)

    curp = fields.CharField(
        max_length=18, null=True, db_index=True
    )

    tipo_victima = fields.CharField(max_length=300, null=True)
    tipo_persona_moral = fields.CharField(max_length=300, null=True)

    sexo = fields.CharField(max_length=100, null=True)
    genero = fields.CharField(max_length=100, null=True)

    poblacion_indigena = fields.CharField(max_length=300, null=True)
    discapacidad = fields.CharField(max_length=300, null=True)

    fecha_nacimiento = fields.CharField(max_length=40, null=True)

    edad = fields.IntField(null=True)

    nacionalidad = fields.CharField(max_length=200, null=True)
    entidad_reportante = fields.CharField(max_length=200, null=True)
    usuario_reportante = fields.CharField(max_length=300, null=True)

    # ========================================
    # CAMPOS SESNSP 17 - 32
    # CORTE, CARPETA Y DELITO
    # ========================================

    anio_corte = fields.IntField(null=True)

    mes_corte = fields.CharField(max_length=30, null=True)
    identificador_carpeta = fields.CharField(
        max_length=200, null=True, db_index=True
    )
    numero_carpeta = fields.CharField(
        max_length=300, null=True, db_index=True
    )
    fecha_inicio_carpeta = fields.CharField(
        max_length=40, null=True
    )
    hora_inicio_carpeta = fields.CharField(
        max_length=30, null=True
    )

    resumen_hechos = fields.TextField(null=True)
    identificador_delito = fields.CharField(
        max_length=200, null=True, db_index=True
    )
    delito_fiscalia = fields.TextField(null=True)
    modalidad_fiscalia = fields.TextField(null=True)
    bien_juridico = fields.TextField(null=True)
    delito_catalogo = fields.TextField(null=True)
    subtipo_delito = fields.TextField(null=True)
    modalidad_catalogo = fields.TextField(null=True)
    forma_accion = fields.TextField(null=True)
    instrumento_comision = fields.TextField(null=True)

    # ========================================
    # CAMPOS SESNSP 33 - 48
    # HECHOS Y UBICACIÓN
    # ========================================

    grado_consumacion = fields.CharField(
        max_length=300, null=True
    )

    fecha_hechos = fields.CharField(max_length=40, null=True)
    hora_hechos = fields.CharField(max_length=30, null=True)

    bien_juridico_sabana = fields.TextField(null=True)
    delito_sabana = fields.TextField(null=True)
    subtipo_delito_sabana = fields.TextField(null=True)
    modalidad_delito_sabana = fields.TextField(null=True)

    entidad_hechos = fields.CharField(max_length=200, null=True)
    municipio_hechos = fields.CharField(max_length=200, null=True)
    localidad_hechos = fields.CharField(max_length=300, null=True)
    colonia_hechos = fields.CharField(max_length=300, null=True)
    codigo_postal = fields.CharField(max_length=20, null=True)

    domicilio_hechos = fields.TextField(null=True)

    coordenada_x = fields.CharField(max_length=100, null=True)
    coordenada_y = fields.CharField(max_length=100, null=True)

    fecha_registro = fields.CharField(max_length=50, null=True)

    # ========================================
    # RESPALDO Y AUDITORÍA
    # ========================================

    datos_sspc = fields.JSONField(null=True)

    fecha_creacion = fields.DatetimeField(
        auto_now_add=True
    )

    class Meta:
        table = "registros_victimas_descargados"

        unique_together = (
            ("descarga", "hash_contenido", "ocurrencia"),
        )
