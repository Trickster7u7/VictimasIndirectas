export interface PerfilInstitucionalFormulario {
  institucion: string;
  area: string;
  cargo: string;
  telefono_institucional: string;
  entidad_federativa: string;
}

export interface PerfilInstitucional {
  id: number;
  institucion: string;
  area: string | null;
  cargo: string | null;
  telefono_institucional: string | null;
  entidad_federativa: string | null;
  observaciones_validacion: string | null;
  fecha_envio_validacion: string | null;
  fecha_validacion: string | null;
}

export interface RespuestaPerfilInstitucional {
  ok: boolean;
  perfil: PerfilInstitucional;
}

export interface RespuestaGuardarPerfilInstitucional {
  ok: boolean;
  mensaje: string;
  estado: string;
  perfil: PerfilInstitucional;
}
