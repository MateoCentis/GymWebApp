export interface AlumnoType {
  id: number;
  agregado_por: number;
  // foto?: string | null;
  nombre_apellido: string;
  fecha_nacimiento: string | null;
  peso: number | null;
  sexo: string;
  altura: number | null;
  telefono: string;
  activo: boolean;
  cuotas: number[];
}

export interface CuotaType {
  id: number;
  month: number;
  year: number;
  monto_dos_dias: number;
  monto_tres_dias: number;
  monto_cuatro_dias: number;
  monto_cinco_dias: number;
}

export interface CuotaAlumnoType {
  id: number;
  alumno: number;
  cuota: number;
  pagada: boolean;
  descuento: number;
  plan: 2 | 3 | 4 | 5;
  monto_pagado: number | null;
  fecha_pago: string | null;
  fecha_vencimiento_cuota: string | null;
}

export interface EjercicioType {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string | null;
}

export interface EjercicioAlumnoType {
  id: number;
  alumno: number;
  ejercicio: number;
  fecha: string;
  peso_repeticion_maxima: number;
}

// Types for DatosPage
export interface MonthlyData {
  month: number;
  year: number;
  totalIncome: number;
  paidPercentage: number;
  totalStudents: number;
  studentsWhoHavePaid: number;
}

export interface PlanData {
  plan: number;
  count: number;
}

export interface ExerciseData {
  exerciseName: string;
  count: number;
  averageWeight: number;
}

export interface MonthlyPlanData {
  month: number;
  planDistribution: PlanData[];
}
