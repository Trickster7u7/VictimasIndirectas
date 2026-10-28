
import asyncio
import time

import httpx

from app.core.configuracion import configuracion


class ProveedorSSPC:

    def __init__(self):
        self.url_base = (
            configuracion.sspc_api_url.rstrip("/")
        )

        # Token guardado temporalmente en el backend
        self._token: str | None = None
        self._vencimiento: float = 0

        # Evita solicitar varios tokens simultáneamente
        self._bloqueo = asyncio.Lock()

        self.timeout = httpx.Timeout(
            connect=10.0,
            read=60.0,
            write=10.0,
            pool=10.0,
        )

    # ====================================
    # 1. OBTENER TOKEN
    # ====================================

    async def obtener_token(self) -> str:

        if (
            self._token
            and time.monotonic() < self._vencimiento
        ):
            return self._token

        async with self._bloqueo:

            if (
                self._token
                and time.monotonic() < self._vencimiento
            ):
                return self._token

            if not all([
                configuracion.sspc_origen,
                configuracion.sspc_usuario,
                configuracion.sspc_password,
            ]):
                raise RuntimeError(
                    "Faltan credenciales SESNSP en el .env."
                )

            cuerpo = {
                "origen": configuracion.sspc_origen,
                "usuario": configuracion.sspc_usuario,
                "password": configuracion.sspc_password,
            }

            async with httpx.AsyncClient(
                timeout=self.timeout
            ) as cliente:

                respuesta = await cliente.post(
                    f"{self.url_base}/auth/token",
                    json=cuerpo,
                    headers={
                        "Accept": "application/json",
                    },
                )
            if respuesta.status_code != 200:
                print("SESNSP - Error de autenticación")
                print("Código HTTP:", respuesta.status_code)
                print("Respuesta:", respuesta.text[:1000])



            respuesta.raise_for_status()

            datos = respuesta.json()

            if not isinstance(datos, dict):
                raise ValueError(
                    "Respuesta de autenticación inválida."
                )

            token = datos.get("accessToken")
            tipo = datos.get("tokenType")
            vigencia = datos.get("expiresIn")

            if not isinstance(token, str) or not token:
                raise ValueError(
                    "SESNSP no devolvió accessToken."
                )

            if str(tipo).lower() != "bearer":
                raise ValueError(
                    "SESNSP devolvió un tipo de token inesperado."
                )

            try:
                segundos = int(vigencia)
            except (TypeError, ValueError):
                raise ValueError(
                    "SESNSP devolvió expiresIn inválido."
                )

            if segundos <= 0:
                raise ValueError(
                    "La vigencia del token es inválida."
                )

            # Renovar antes del vencimiento
            margen = min(60, segundos * 0.1)

            self._token = token
            self._vencimiento = (
                time.monotonic()
                + max(1, segundos - margen)
            )

            return token

    # ====================================
    # 2. GET CON AUTENTICACIÓN
    # ====================================

    async def _consultar(
        self,
        ruta: str,
        parametros: dict | None = None,
    ):

        for intento in range(2):

            token = await self.obtener_token()

            async with httpx.AsyncClient(
                timeout=self.timeout
            ) as cliente:

                respuesta = await cliente.get(
                    f"{self.url_base}{ruta}",
                    params=parametros,
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Accept": "application/json",
                    },
                )

            # Si el token fue invalidado
            # anticipadamente, renovarlo una vez.
            if (
                respuesta.status_code == 401
                and intento == 0
            ):
                async with self._bloqueo:
                    if self._token == token:
                        self._token = None
                        self._vencimiento = 0

                continue

            respuesta.raise_for_status()
            return respuesta.json()

        raise RuntimeError(
            "No fue posible consultar SESNSP."
        )

    # ====================================
    # 3. COMPROBAR SESIÓN
    # ====================================

    async def comprobar_sesion(self):
        return await self._consultar("/auth/me")

    # ====================================
    # 4. CONSULTAR PERIODO
    # ====================================

    async def consultar_registros(
        self,
        anio: int,
        mes: int,
    ) -> list[dict]:

        if not 2000 <= anio <= 2100:
            raise ValueError("Año inválido.")

        if not 1 <= mes <= 12:
            raise ValueError("Mes inválido.")

        datos = await self._consultar(
            ruta="/consulta",
            parametros={
                "anio": anio,
                "mes": mes,
                "formato": "json",
            },
        )

        if not isinstance(datos, list):
            raise ValueError(
                "SESNSP no devolvió una lista."
            )

        if not all(
            isinstance(registro, dict)
            for registro in datos
        ):
            raise ValueError(
                "SESNSP devolvió registros inválidos."
            )

        return datos


# Instancia compartida por el proceso FastAPI
proveedor_sspc = ProveedorSSPC()
