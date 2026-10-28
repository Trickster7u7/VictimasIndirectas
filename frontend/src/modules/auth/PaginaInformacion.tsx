import { usarAutenticacion } from './usarAutenticacion';

export function PaginaPerfil() {
  const { usuario } = usarAutenticacion();

  if (!usuario) {
    return null;
  }

  return (
    <section className="pagina-perfil">
      <div className="pagina-perfil__encabezado">
        <span className="etiqueta-seccion">Cuenta</span>
        <h1>Información del usuario</h1>
        <p>
          Información disponible en la sesión local después de la autenticación
          con Llave MX.
        </p>
      </div>

      <div className="contenedor-usuario">
        <div className="rejilla-usuario">
          <div className="campo">
            <label>ID de usuario</label>
            <input value={usuario.id} readOnly />
          </div>

          <div className="campo">
            <label>Nombre</label>
            <input value={usuario.nombre ?? ''} readOnly />
          </div>

          <div className="campo">
            <label>Primer apellido</label>
            <input value={usuario.primer_apellido ?? ''} readOnly />
          </div>

          <div className="campo">
            <label>Segundo apellido</label>
            <input value={usuario.segundo_apellido ?? ''} readOnly />
          </div>

          <div className="campo">
            <label>Correo electrónico</label>
            <input value={usuario.correo ?? ''} readOnly />
          </div>

          <div className="campo">
            <label>Estado</label>
            <input value={usuario.estado} readOnly />
          </div>
        </div>
      </div>
    </section>
  );
}
