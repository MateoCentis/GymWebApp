export interface AlumnoType {
  id: number;
  nombre_apellido: string;
  telefono: string;
  fecha_inicio_gym: string; // Django lo manda como string en formato "YYYY-MM-DD"
  activo: boolean;
}
