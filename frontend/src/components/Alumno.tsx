import React from "react";
import type { AlumnoType } from "../types";

interface Props {
  alumno: AlumnoType;
  onDelete: (id: number) => void;
}
function Alumno({ alumno, onDelete }: Props) {
  const fechaFormateada = new Date(alumno.fecha_inicio_gym).toLocaleDateString(
    "es-AR"
  );
  return (
    <div className="alumno-container">
      <p className="alumno-nombre-apellido">{alumno.nombre_apellido}</p>
      <p className="alumno-telefono">{alumno.telefono}</p>
      <p className="alumno-fecha-inicio">{fechaFormateada}</p>
      <button onClick={() => onDelete(alumno.id)}>Eliminar</button>
    </div>
  );
}

export default Alumno;
