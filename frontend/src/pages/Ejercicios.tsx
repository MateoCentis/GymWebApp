import { useState, useEffect } from "react";
import api from "../api";
import Nabvar from "../components/Navbar";
import Table from "../components/Table";
import SearchBar from "../components/SearchBar";
import Footer from "../components/Footer";
import { EjercicioType, AlumnoType, EjercicioAlumnoType } from "../types";
import EjercicioModal from "../components/EjercicioModal";
import EjercicioAlumnoModal from "../components/EjercicioAlumnoModal";
import "../styles/Title.css";
import "../styles/Table.css";

function Ejercicios() {
  // State for Ejercicios
  const [ejercicios, setEjercicios] = useState<EjercicioType[]>([]);
  const [isEjercicioModalOpen, setIsEjercicioModalOpen] = useState(false);
  const [ejercicioToEdit, setEjercicioToEdit] = useState<EjercicioType | null>(
    null
  );
  const [searchTermEjercicio, setSearchTermEjercicio] = useState("");

  // State for EjercicioAlumnos
  const [ejercicioAlumnos, setEjercicioAlumnos] = useState<
    EjercicioAlumnoType[]
  >([]);
  const [isEjercicioAlumnoModalOpen, setIsEjercicioAlumnoModalOpen] =
    useState(false);
  const [ejercicioAlumnoToEdit, setEjercicioAlumnoToEdit] =
    useState<EjercicioAlumnoType | null>(null);
  const [alumnos, setAlumnos] = useState<AlumnoType[]>([]);
  const [searchTermRecord, setSearchTermRecord] = useState("");

  // Table sorting
  const [sortKeyEjercicio, setSortKeyEjercicio] = useState<
    keyof EjercicioType | null
  >(null);
  const [sortKeyRecord, setSortKeyRecord] = useState<
    keyof EjercicioAlumnoType | null
  >(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Load data on component mount
  useEffect(() => {
    fetchEjercicios();
    fetchEjercicioAlumnos();
    fetchAlumnos();
  }, []);

  // API calls
  const fetchEjercicios = async () => {
    try {
      const res = await api.get("/api/ejercicios/");
      setEjercicios(res.data);
    } catch (error) {
      console.error("Error fetching ejercicios:", error);
    }
  };

  const fetchEjercicioAlumnos = async () => {
    try {
      const res = await api.get("/api/ejercicioalumno/");
      setEjercicioAlumnos(res.data);
    } catch (error) {
      console.error("Error fetching ejercicio alumnos:", error);
    }
  };

  const fetchAlumnos = async () => {
    try {
      const res = await api.get("/api/alumnos/");
      setAlumnos(res.data);
    } catch (error) {
      console.error("Error fetching alumnos:", error);
    }
  };

  // Ejercicio CRUD operations
  const handleCreateEjercicio = async (formData: FormData) => {
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      const res = await api.post("/api/ejercicios/", formData, config);
      setEjercicios([...ejercicios, res.data]);
      setIsEjercicioModalOpen(false);
    } catch (error) {
      console.error("Error creating ejercicio:", error);
      alert("Error al crear ejercicio");
    }
  };

  const handleUpdateEjercicio = async (id: number, formData: FormData) => {
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      const res = await api.put(`/api/ejercicios/${id}/`, formData, config);
      setEjercicios(ejercicios.map((ej) => (ej.id === id ? res.data : ej)));
      setIsEjercicioModalOpen(false);
      setEjercicioToEdit(null);
    } catch (error) {
      console.error("Error updating ejercicio:", error);
      alert("Error al actualizar ejercicio");
    }
  };

  const handleDeleteEjercicio = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este ejercicio?")) {
      try {
        await api.delete(`/api/ejercicios/${id}/`);
        setEjercicios(ejercicios.filter((ej) => ej.id !== id));
      } catch (error) {
        console.error("Error deleting ejercicio:", error);
        alert("Error al eliminar ejercicio");
      }
    }
  };

  // EjercicioAlumno CRUD operations
  const handleCreateEjercicioAlumno = async (
    data: Omit<EjercicioAlumnoType, "id" | "fecha">
  ) => {
    try {
      console.log("Sending data to server:", data);
      const res = await api.post("/api/ejercicioalumno/", data);
      console.log("Server response:", res.data);
      setEjercicioAlumnos([...ejercicioAlumnos, res.data]);
      setIsEjercicioAlumnoModalOpen(false);
    } catch (error) {
      console.error("Error creating ejercicio alumno:", error);
      alert("Error al crear registro de ejercicio");
    }
  };

  const handleUpdateEjercicioAlumno = async (
    data: Omit<EjercicioAlumnoType, "id" | "fecha">
  ) => {
    if (!ejercicioAlumnoToEdit) return;

    try {
      const res = await api.put(
        `/api/ejercicioalumno/${ejercicioAlumnoToEdit.id}/`,
        data
      );
      setEjercicioAlumnos(
        ejercicioAlumnos.map((record) =>
          record.id === ejercicioAlumnoToEdit.id ? res.data : record
        )
      );
      setIsEjercicioAlumnoModalOpen(false);
      setEjercicioAlumnoToEdit(null);
    } catch (error) {
      console.error("Error updating ejercicio alumno:", error);
      alert("Error al actualizar registro de ejercicio");
    }
  };

  const handleDeleteEjercicioAlumno = async (id: number) => {
    if (
      window.confirm("¿Estás seguro de eliminar este registro de ejercicio?")
    ) {
      try {
        await api.delete(`/api/ejercicioalumno/${id}/`);
        setEjercicioAlumnos(
          ejercicioAlumnos.filter((record) => record.id !== id)
        );
      } catch (error) {
        console.error("Error deleting ejercicio alumno:", error);
        alert("Error al eliminar registro de ejercicio");
      }
    }
  };

  // Modal handlers
  const openEjercicioModal = () => {
    setEjercicioToEdit(null);
    setIsEjercicioModalOpen(true);
  };

  const openEditEjercicioModal = (ejercicio: EjercicioType) => {
    setEjercicioToEdit(ejercicio);
    setIsEjercicioModalOpen(true);
  };

  const openEjercicioAlumnoModal = () => {
    setEjercicioAlumnoToEdit(null);
    setIsEjercicioAlumnoModalOpen(true);
  };

  const openEditEjercicioAlumnoModal = (record: EjercicioAlumnoType) => {
    setEjercicioAlumnoToEdit(record);
    setIsEjercicioAlumnoModalOpen(true);
  };

  // Helper function to get the correct image URL
  const getImageUrl = (path: string | null) => {
    if (!path) return null;

    // If the path already includes the full URL, return it as is
    if (path.startsWith("http")) {
      return path;
    }

    // If the path is just the relative path, prepend the base URL
    return `${api.defaults.baseURL}${path}`;
  };

  // Table columns for Ejercicios
  const ejercicioColumns = [
    {
      title: "Imagen",
      key: "imagen",
      render: (item: EjercicioType) =>
        item.imagen ? (
          <img
            src={getImageUrl(item.imagen)}
            alt={item.nombre}
            style={{ maxHeight: "50px" }}
          />
        ) : (
          "Sin imagen"
        ),
      sortable: false,
    },
    { title: "Nombre", key: "nombre", sortable: true },
    { title: "Descripción", key: "descripcion", sortable: false },
    {
      title: "Acciones",
      key: "actions",
      render: (item: EjercicioType) => (
        <div className="buttons are-small">
          <button
            className="button is-info"
            onClick={() => openEditEjercicioModal(item)}
          >
            <span className="icon">
              <i className="fas fa-edit"></i>
            </span>
            <span>Editar</span>
          </button>
          <button
            className="button is-danger"
            onClick={() => handleDeleteEjercicio(item.id)}
          >
            <span className="icon">
              <i className="fas fa-trash"></i>
            </span>
            <span>Eliminar</span>
          </button>
        </div>
      ),
      sortable: false,
    },
  ];

  const ejercicioAlumnoColumns = [
    {
      title: "Alumno",
      key: "alumno",
      render: (item: EjercicioAlumnoType) => {
        const alumno = alumnos.find((a) => a.id === item.alumno);
        return alumno ? alumno.nombre_apellido : `ID: ${item.alumno}`;
      },
      sortable: false,
    },
    {
      title: "Ejercicio",
      key: "ejercicio",
      render: (item: EjercicioAlumnoType) => {
        const ejercicio = ejercicios.find((e) => e.id === item.ejercicio);
        return ejercicio ? ejercicio.nombre : `ID: ${item.ejercicio}`;
      },
      sortable: false,
    },
    { title: "Fecha", key: "fecha", sortable: true },
    {
      title: "Peso Repetición Máxima (kg)",
      key: "peso_repeticion_maxima",
      sortable: true,
    },
    {
      title: "Acciones",
      key: "actions",
      render: (item: EjercicioAlumnoType) => (
        <div className="buttons are-small">
          <button
            className="button is-info"
            onClick={() => openEditEjercicioAlumnoModal(item)}
          >
            <span className="icon">
              <i className="fas fa-edit"></i>
            </span>
            <span>Editar</span>
          </button>
          <button
            className="button is-danger"
            onClick={() => handleDeleteEjercicioAlumno(item.id)}
          >
            <span className="icon">
              <i className="fas fa-trash"></i>
            </span>
            <span>Eliminar</span>
          </button>
        </div>
      ),
      sortable: false,
    },
  ];

  // Search and filter
  const filteredEjercicios = ejercicios.filter((ejercicio) =>
    ejercicio.nombre.toLowerCase().includes(searchTermEjercicio.toLowerCase())
  );

  const filteredEjercicioAlumnos = ejercicioAlumnos.filter((record) => {
    const alumno = alumnos.find((a) => a.id === record.alumno);
    const ejercicio = ejercicios.find((e) => e.id === record.ejercicio);

    return (
      alumno?.nombre_apellido
        ?.toLowerCase()
        .includes(searchTermRecord.toLowerCase()) ||
      ejercicio?.nombre?.toLowerCase().includes(searchTermRecord.toLowerCase())
    );
  });

  // Sorting handlers
  const handleSortEjercicio = (key: keyof EjercicioType) => {
    if (key === sortKeyEjercicio) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKeyEjercicio(key);
      setSortDirection("asc");
    }
  };

  const handleSortRecord = (key: keyof EjercicioAlumnoType) => {
    if (key === sortKeyRecord) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKeyRecord(key);
      setSortDirection("asc");
    }
  };

  // Apply sorting to column props
  const ejercicioColumnsWithProps = ejercicioColumns.map((column) => ({
    ...column,
    headerProps: {
      onClick: column.sortable
        ? () => handleSortEjercicio(column.key as keyof EjercicioType)
        : undefined,
      style: column.sortable ? { cursor: "pointer" } : undefined,
    },
  }));

  const ejercicioAlumnoColumnsWithProps = ejercicioAlumnoColumns.map(
    (column) => ({
      ...column,
      headerProps: {
        onClick: column.sortable
          ? () => handleSortRecord(column.key as keyof EjercicioAlumnoType)
          : undefined,
        style: column.sortable ? { cursor: "pointer" } : undefined,
      },
    })
  );

  return (
    <div>
      <Nabvar />
      <div className="title-container">
        <h1 className="title big-title is-family-sans-serif">Ejercicios</h1>
      </div>

      {/* Ejercicios Section */}
      <section className="section">
        <h2 className="title is-4">Lista de Ejercicios</h2>
        <div className="search-bar-container">
          <div className="search-bar-wrapper">
            <SearchBar
              onSearch={setSearchTermEjercicio}
              placeholder="Buscar ejercicios"
              leftIcon="search"
              rightIcon="dumbbell"
            />
          </div>
          <button
            className="button ml-3 is-responsive is-outlined color-boton-searchbar"
            onClick={openEjercicioModal}
          >
            <span className="icon">
              <i className="fas fa-plus"></i>
            </span>
            <span>Nuevo Ejercicio</span>
          </button>
        </div>

        <div className="table-container">
          <Table
            items={filteredEjercicios}
            columns={ejercicioColumnsWithProps}
            className="is-fullwidth is-striped is-hoverable is-bordered"
          />
        </div>
      </section>

      {/* Ejercicio Alumnos Section */}
      <section className="section">
        <h2 className="title is-4">Registros de Ejercicios</h2>
        <div className="search-bar-container">
          <div className="search-bar-wrapper">
            <SearchBar
              onSearch={setSearchTermRecord}
              placeholder="Buscar registros"
              leftIcon="search"
              rightIcon="clipboard-list"
            />
          </div>
          <button
            className="button ml-3 is-responsive is-outlined color-boton-searchbar"
            onClick={openEjercicioAlumnoModal}
          >
            <span className="icon">
              <i className="fas fa-plus"></i>
            </span>
            <span>Nuevo Registro</span>
          </button>
        </div>

        <div className="table-container">
          <Table
            items={filteredEjercicioAlumnos}
            columns={ejercicioAlumnoColumnsWithProps}
            className="is-fullwidth is-striped is-hoverable is-bordered"
          />
        </div>
      </section>

      {/* Modals */}
      <EjercicioModal
        isOpen={isEjercicioModalOpen}
        onClose={() => setIsEjercicioModalOpen(false)}
        onCreate={handleCreateEjercicio}
        onEdit={handleUpdateEjercicio}
        ejercicioToEdit={ejercicioToEdit}
      />

      <EjercicioAlumnoModal
        isOpen={isEjercicioAlumnoModalOpen}
        onClose={() => setIsEjercicioAlumnoModalOpen(false)}
        onCreate={handleCreateEjercicioAlumno}
        onEdit={handleUpdateEjercicioAlumno}
        ejercicioAlumnoToEdit={ejercicioAlumnoToEdit}
        ejercicios={ejercicios}
        alumnos={alumnos}
      />

      <Footer />
    </div>
  );
}

export default Ejercicios;
