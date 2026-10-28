
export interface PeriodoConsultaVictimas {
  mes: number;
  anio: number;
}

export interface RegistroVictimaResumen {
  id_registro: string;

  curp: string | null;
  nombre_completo: string;

  fecha_hechos: string | null;
  entidad_hechos: string | null;
  numero_carpeta: string | null;

  numero_nna_relacionados: number | null;
  edad: number | null; // Nuevo campo
  estado_consulta_nna:
    | 'pendiente'
    | 'consultado'
    | 'sin_nna'
    | 'error';

  estatus_validacion: string | null;
}
