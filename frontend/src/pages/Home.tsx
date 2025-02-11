import { useState, useEffect } from "react";
import api from "../api";
import type { AlumnoType } from "../types";
import Alumno from "../components/Alumno";
import "../styles/Home.css";
function Home() {
  const [alumnos, setAlumnos] = useState([]);
  const [nombre_apellido, setNombre_apellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    getAlumnos();
  }, []);

  const getAlumnos = () => {
    api
      .get("/api/alumnos/")
      .then((res) => res.data)
      .then((data) => {
        setAlumnos(data);
        console.log(data);
      })
      .catch((error) => alert(error));
  };

  const deleteAlumno = (idAlumno: number) => {
    api
      .delete(`/api/alumnos/delete/${idAlumno}/`)
      .then((res) => {
        if (res.status === 204) alert("Alumno eliminado");
        else alert("Fallo al eliminar alumno");
        getAlumnos(); //No deberiamos traer todo de nuevo sino que deberíamos borrar el alumno de la lista (TODO)
      })
      .catch((error) => alert(error));
  };

  const createAlumno = (e: React.FormEvent) => {
    e.preventDefault();
    api
      .post("/api/alumnos/", { nombre_apellido, telefono, activo })
      .then((res) => {
        if (res.status === 201) alert("Alumno creado");
        else alert("Fallo al crear alumno");
        getAlumnos(); // Acá lo mismo (TODO)
      })
      .catch((error) => alert(error));
  };
  return (
    <div>
      <div>
        <h2> Alumnos </h2>
        {alumnos.map((alumno: AlumnoType) => (
          <Alumno alumno={alumno} onDelete={deleteAlumno} key={alumno.id} />
        ))}
      </div>
      <h2> Crear Alumno </h2>
      <form onSubmit={createAlumno}>
        <label htmlFor="nombre_apellido"> Nombre y apellido:</label>
        <br />
        <input
          type="text"
          id="nombre_apellido"
          name="nombre_apellido"
          required
          value={nombre_apellido}
          onChange={(e) => setNombre_apellido(e.target.value)}
        />
        <label htmlFor="telefono"> Telefono:</label>
        <br />
        <input
          type="tel"
          id="telefono"
          name="telefono"
          required
          maxLength={20}
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
        <br />
        <input type="submit" value="Submit"></input>
      </form>
    </div>
  );
}

export default Home;
