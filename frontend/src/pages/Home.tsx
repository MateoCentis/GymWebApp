import { useState, useEffect } from "react";
import api from "../api";
//Componentes
import Nabvar from "../components/Navbar";
import Table from "../components/Table";
import SearchBar from "../components/SearchBar";
import AlumnoModal from "../components/AlumnoModal";
//Tipos
import { AlumnoType } from "../types";
//Estilos
import "../styles/Home.css";
import "../styles/SearchBar.css";
import "../styles/Title.css";
import "../styles/Table.css";

function Home() {
  const [alumnos, setAlumnos] = useState<AlumnoType[]>([]); //Data de la tabla
  const [isModalOpen, setIsModalOpen] = useState(false); // Para crear alumnos
  const [alumnoToEdit, setAlumnoToEdit] = useState<AlumnoType | null>(null); // Para editar un alumno
  const [isCreating, setIsCreating] = useState(false);
  // Tabla
  const [sortKey, setSortKey] = useState<keyof AlumnoType | null>(null); // State for sorting
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Barra
  const [searchTerm, setSearchTerm] = useState("");

  // Tabla
  const tableColumns = [
    // { title: "ID", key: "id" }, //
    { title: "Nombre y Apellido", key: "nombre_apellido", sortable: true },
    { title: "Teléfono", key: "telefono", sortable: false },
    { title: "Edad", key: "edad", sortable: true },
    { title: "Altura (cm)", key: "altura", sortable: true },
    { title: "Peso (kg)", key: "peso", sortable: true },
    {
      title: "Activo",
      key: "activo",
      render: (item: AlumnoType) => (item.activo ? "Sí" : "No"),
    }, // TODO: agregar un check donde se quiera mostrar o no el activo
    {
      title: "Acciones", // Added actions column
      key: "actions",
      render: (item: AlumnoType) => (
        <div className="d-flex align-items-center">
          <button
            className="button is-small is-primary mr-2" // Added edit button
            // onClick={() => openEditModal(item)}
          >
            Info
          </button>
          <button
            className="button is-small is-info mr-2" // Added edit button
            onClick={() => openEditModal(item)}
          >
            Editar
          </button>
          <button
            className="button is-small is-danger"
            onClick={() => deleteAlumno(item.id)}
          >
            Eliminar
          </button>
        </div>
      ),
      sortable: false,
    },
  ];

  // Hook
  useEffect(() => {
    getAlumnos();
  }, []);

  // Funciones

  // Traer alumnos
  const getAlumnos = async () => {
    try {
      const res = await api.get("/api/alumnos/");
      const data = res.data as AlumnoType[];
      const alumnosWithAgeCalculated = data.map((alumno) => ({
        ...alumno,
        edad: calculateAge(alumno.fecha_nacimiento),
      }));
      setAlumnos(alumnosWithAgeCalculated);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditAlumno = async (
    editedAlumnoData: Omit<
      AlumnoType,
      "id" | "edad" | "cuotas" | "ejercicios" | "agregado_por"
    >
  ) => {
    if (!alumnoToEdit) return; // Solo si hay un alumno para editar

    try {
      const res = await api.put(
        `/api/alumnos/${alumnoToEdit.id}/`, // Use PUT for updates
        editedAlumnoData
      );
      if (res.status === 200) {
        alert("Alumno modificado");
        getAlumnos(); // Refresh the alumno list
        closeEditModal(); // Close the modal
      } else {
        alert("Fallo al modificar alumno");
      }
    } catch (error) {
      alert(error);
    }
  };

  // Eliminar alumno
  const deleteAlumno = (idAlumno: number) => {
    const encodedId = encodeURIComponent(idAlumno.toString());
    api
      .delete(`/api/alumnos/${encodedId}/`)
      .then((res) => {
        if (res.status === 204) {
          alert("Alumno eliminado");
          setAlumnos(alumnos.filter((alumno) => alumno.id !== idAlumno));
        } else {
          alert("Fallo al eliminar alumno");
        }
      })
      .catch((error) => alert(error));
  };

  // Modal para abrir
  const openModal = () => {
    setIsCreating(true);
    setAlumnoToEdit(null); // Clear alumnoToEdit (important!)
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  // Modal para editar
  const closeEditModal = () => {
    setIsCreating(false); // Reset to false
    setAlumnoToEdit(null);
    closeModal();
  };

  const openEditModal = (alumno: AlumnoType) => {
    setIsCreating(false); // Set to false when opening for editing
    setAlumnoToEdit(alumno);
    setIsModalOpen(true);
  };

  const handleCreateAlumno = async (
    newAlumnoData: Omit<
      AlumnoType,
      "id" | "edad" | "cuotas" | "ejercicios" | "agregado_por"
    >
  ) => {
    try {
      const res = await api.post("/api/alumnos/", newAlumnoData);
      if (res.status === 201) {
        alert("Alumno creado");
        getAlumnos();
        closeEditModal();
        setIsCreating(false);
      } else {
        alert("Fallo al crear alumno");
      }
    } catch (error) {
      alert(error);
    }
  };

  const handleSort = (key: keyof AlumnoType) => {
    if (key === sortKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const columnsWithProps = tableColumns.map((column) => ({
    ...column,
    headerProps: {
      onClick: column.sortable
        ? () => handleSort(column.key as keyof AlumnoType)
        : undefined,
      style: column.sortable ? { cursor: "pointer" } : undefined,
    },
  }));

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filteredAlumnos = alumnos.filter((alumno) => {
    const fullName = alumno?.nombre_apellido?.toLowerCase() ?? "";
    return fullName.includes(searchTerm.toLowerCase());
  });

  const sortedAndFilteredAlumnos = sortKey
    ? [...filteredAlumnos].sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        if (typeof aValue === "string" && typeof bValue === "string") {
          return (
            aValue.localeCompare(bValue) * (sortDirection === "asc" ? 1 : -1)
          ); // Correct string comparison
        } else if (typeof aValue === "number" && typeof bValue === "number") {
          return (aValue - bValue) * (sortDirection === "asc" ? 1 : -1); // Correct number comparison
        } else if (typeof aValue === "boolean" && typeof bValue === "boolean") {
          return (
            (aValue === bValue ? 0 : aValue ? -1 : 1) *
            (sortDirection === "asc" ? 1 : -1)
          );
        } else if (aValue === undefined || aValue === null) {
          // Handle undefined and null
          return -1; // Put undefined/null at the beginning
        } else if (bValue === undefined || bValue === null) {
          return 1; // Put undefined/null at the beginning
        } else {
          return 0; // Default case (should be handled more specifically if possible)
        }
      })
    : filteredAlumnos;

  const calculateAge = (
    fechaNacimiento: string | null | undefined
  ): number | null => {
    if (!fechaNacimiento) return null;
    const birthDate = new Date(fechaNacimiento);
    const currentDate = new Date();

    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = currentDate.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };
  return (
    <div>
      <Nabvar />
      <div className="title-container">
        <h1 className="title is-family-sans-serif">Alumnos</h1>
      </div>
      <div className="search-bar-container">
        <div className="search-bar-wrapper">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Buscar alumnos"
            leftIcon="search"
            rightIcon="user-circle"
          />
        </div>
        <button
          className="button ml-3 is-responsive is-outlined color-boton-searchbar"
          onClick={openModal}
        >
          Agregar
        </button>
      </div>
      <div className="table-container">
        <Table
          items={sortedAndFilteredAlumnos}
          columns={columnsWithProps}
          className="is-fullwidth is-striped is-hoverable is-bordered"
        />
      </div>
      <div>
        <AlumnoModal
          isOpen={isModalOpen}
          onClose={closeEditModal}
          onCreate={handleCreateAlumno}
          alumnoToEdit={alumnoToEdit}
          onEdit={handleEditAlumno}
          isCreating={isCreating}
        />
      </div>
    </div>
  );
}
export default Home;
