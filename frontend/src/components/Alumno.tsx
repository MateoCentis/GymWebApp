import { AlumnoType } from "../types/alumno";
import "../styles/Alumno.css";

interface AlumnoProps {
  alumno: AlumnoType;
  onClick?: () => void;
}

const Alumno = ({ alumno, onClick }: AlumnoProps) => {
  const fechaFormateada = alumno.fecha_inicio_gym
    ? new Date(alumno.fecha_inicio_gym).toLocaleDateString("es-AR")
    : "N/A";

  return (
    <div className="alumno-container">
      <p className="alumno-nombre-apellido">{alumno.nombre_apellido}</p>
      <p className="alumno-telefono">{alumno.telefono}</p>
      <p className="alumno-fecha-inicio">{fechaFormateada}</p>
      <button onClick={onClick}>Eliminar</button>
    </div>
  );
};

export default Alumno;
