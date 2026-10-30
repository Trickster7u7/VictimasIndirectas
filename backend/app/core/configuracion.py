from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Configuracion(BaseSettings):
    cookies_seguras: bool = False
    nombre_aplicacion: str = ""
    entorno: str = ""
    
    frontend_url_quas: str = "https://dticap.dif.gob.mx"
    ##frontend_url_quas: str = "http://localhost:5173/"
    
    url_base_datos: str = ""
    llave_client_id: str = ""
    llave_client_secret: str = ""
    llave_basic_user: str = ""
    llave_basic_password: str = ""
    llave_redirect_uri: str = ""
    llave_auth_url: str = ""
    llave_api_url: str = ""
    llave_datos_usuario_url: str = ""

    secreto_sesion: str = ""

    # Configuración de la API SESNSP
    sspc_api_url: str = "https://cni03.sspc.gob.mx/apiFeminicidios"
    sspc_origen: str = ""
    sspc_usuario: str = ""
    sspc_password: str = ""
    sspc_sync_user_ids: str = ""
    sspc_sync_todos: bool = False
    
    rbac_proteger_rutas_existentes: bool = False
    model_config = SettingsConfigDict(
    env_file=".env",
    env_file_encoding="utf-8",
    case_sensitive=False,
    extra="ignore",
    )


@lru_cache
def obtener_configuracion() -> Configuracion:
    return Configuracion()


configuracion = obtener_configuracion()
