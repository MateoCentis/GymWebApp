export interface AlumnoType {
  id: number;
  agregado_por: number;
  nombre_apellido: string;
  fecha_nacimiento: string | null;
  peso: number | null;
  sexo: string;
  altura: number | null;
  telefono: string;
  activo: boolean;
  cuotas: number[];
}
