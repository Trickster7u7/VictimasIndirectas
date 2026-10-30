from tortoise.expressions import Q

from app.modules.usuarios.dto.AccesosDTO import (
    PaginaUsuariosDTO,
    UsuarioAdministracionDTO,
)
from app.modules.usuarios.models.UsuarioModel import Usuario
from app.modules.usuarios.models.catalogos.EstatusUsuarioModel import EstadoUsuario


class ServicioAdministracionUsuarios:
    @staticmethod
    async def listar(
        buscar: str,
        estado: EstadoUsuario | None,
        pagina: int,
        limite: int,
    ) -> PaginaUsuariosDTO:
        consulta = Usuario.all()
        if buscar:
            consulta = consulta.filter(
                Q(nombre__icontains=buscar)
                | Q(primer_apellido__icontains=buscar)
                | Q(segundo_apellido__icontains=buscar)
                | Q(correo__icontains=buscar)
                | (Q(id=int(buscar)) if buscar.isdecimal() and len(buscar) <= 9 else Q(id=-1))
            )
        if estado is not None:
            consulta = consulta.filter(estado=estado)

        total = await consulta.count()
        usuarios = await consulta.order_by("id").offset(
            (pagina - 1) * limite
        ).limit(limite).values(
            "id", "nombre", "primer_apellido", "segundo_apellido", "correo", "estado"
        )
        return PaginaUsuariosDTO(
            usuarios=[UsuarioAdministracionDTO.model_validate(u) for u in usuarios],
            total=total,
            pagina=pagina,
            limite=limite,
        )
