export interface AlumnoType {
  id: number;
  nombre_apellido: string;
  dni: string;
  telefono: string;
  fecha_nacimiento: string;
  fecha_inicio_gym?: string; // Added as optional
  foto?: string | null;
  activo: boolean;
  agregado_por: number;
  creado: string;
  actualizado: string;
  // Add any other fields that might be missing
}

// Other type definitions...
