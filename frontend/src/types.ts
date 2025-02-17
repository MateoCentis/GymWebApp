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

interface CuotaType {
  id: number;
  month: number;
  year: number;
  monto_dos_dias: number;
  monto_tres_dias: number;
  monto_cuatro_dias: number;
  monto_cinco_dias: number;
}

interface CuotaAlumnoType {
  id: number;
  alumno: number; // ID of the alumno
  cuota: number; // ID of the cuota
  pagada: boolean;
  descuento: number;
  plan: 2 | 3 | 4 | 5;
  monto_pagado: number | null;
  fecha_pago: string | null;
  fecha_vencimiento_cuota: string | null;
}

interface EjercicioType {}

interface EjercicioAlumnoType {}
