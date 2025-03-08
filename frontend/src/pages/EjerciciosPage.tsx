import { useState, useEffect } from "react";
import api from "../api";
import Nabvar from "../components/Navbar";
import Table from "../components/Table";
import SearchBar from "../components/SearchBar";
import Footer from "../components/Footer";
import Loading from "../components/Loading";
import { EjercicioType, AlumnoType, EjercicioAlumnoType } from "../types";
import EjercicioModal from "../components/EjercicioModal";
import EjercicioAlumnoModal from "../components/EjercicioAlumnoModal";
import Select from "../components/Select";
import "../styles/Title.css";
import "../styles/Table.css";
import "../styles/Ejercicios.css";
import { formatDateToDDMMYYYY } from "../utils/dateUtils";

// Define tab options
enum TabOption {
  EJERCICIOS_ALUMNO = "ejercicios_alumno",
  GESTION_EJERCICIOS = "gestion_ejercicios",
}

function EjerciciosPage() {
  // Add tab state
  const [activeTab, setActiveTab] = useState<TabOption>(
    TabOption.EJERCICIOS_ALUMNO
  );

  // State for Ejercicios
  const [ejercicios, setEjercicios] = useState<EjercicioType[]>([]);
  const [isEjercicioModalOpen, setIsEjercicioModalOpen] = useState(false);
  const [ejercicioToEdit, setEjercicioToEdit] = useState<EjercicioType | null>(
    null
  );
  const [searchTermEjercicio, setSearchTermEjercicio] = useState("");
  const [loading, setLoading] = useState(false);

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

  // New state for filtering ejercicios
  const [filteredEjercicioId, setFilteredEjercicioId] = useState<
    number | "all"
  >("all");

  // Table sorting
  const [sortKeyEjercicio, setSortKeyEjercicio] = useState<
    keyof EjercicioType | null
  >(null);
  const [sortKeyRecord, setSortKeyRecord] = useState<
    keyof EjercicioAlumnoType | string | null
  >(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Combined fetch function to manage loading state
  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchEjercicios(),
        fetchEjercicioAlumnos(),
        fetchAlumnos(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

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
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEjercicio = async (id: number, formData: FormData) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEjercicio = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este ejercicio?")) {
      try {
        setLoading(true);
        await api.delete(`/api/ejercicios/${id}/`);
        setEjercicios(ejercicios.filter((ej) => ej.id !== id));
      } catch (error) {
        console.error("Error deleting ejercicio:", error);
        alert("Error al eliminar ejercicio");
      } finally {
        setLoading(false);
      }
    }
  };

  // EjercicioAlumno CRUD operations
  const handleCreateEjercicioAlumno = async (
    data: Omit<EjercicioAlumnoType, "id" | "fecha">
  ) => {
    try {
      setLoading(true);
      console.log("Sending data to server:", data);
      const res = await api.post("/api/ejercicioalumno/", data);
      console.log("Server response:", res.data);
      setEjercicioAlumnos([...ejercicioAlumnos, res.data]);
      setIsEjercicioAlumnoModalOpen(false);
    } catch (error) {
      console.error("Error creating ejercicio alumno:", error);
      alert("Error al crear registro de ejercicio");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEjercicioAlumno = async (
    data: Omit<EjercicioAlumnoType, "id" | "fecha">
  ) => {
    if (!ejercicioAlumnoToEdit) return;

    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEjercicioAlumno = async (id: number) => {
    if (
      window.confirm("¿Estás seguro de eliminar este registro de ejercicio?")
    ) {
      try {
        setLoading(true);
        await api.delete(`/api/ejercicioalumno/${id}/`);
        setEjercicioAlumnos(
          ejercicioAlumnos.filter((record) => record.id !== id)
        );
      } catch (error) {
        console.error("Error deleting ejercicio alumno:", error);
        alert("Error al eliminar registro de ejercicio");
      } finally {
        setLoading(false);
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

  // Función para obtener la URL correcta de la imagen
  const getImageUrl = (path: string | null): string | undefined => {
    if (!path) return undefined;

    // If the path already includes the full URL, return it as is
    if (path.startsWith("http")) {
      return path;
    }

    // If the path is just the relative path, prepend the base URL
    return `${api.defaults.baseURL}${path}`;
  };

  // Function to calculate relative strength
  const calculateRelativeStrength = (record: EjercicioAlumnoType): number => {
    const alumno = alumnos.find((a) => a.id === record.alumno);
    if (!alumno || !alumno.peso || alumno.peso <= 0) {
      return 0;
    }
    return record.peso_repeticion_maxima / alumno.peso;
  };

  // Table columns for Ejercicios
  const ejercicioColumns = [
    {
      title: "Imagen",
      key: "imagen",
      render: (item: EjercicioType) => (
        <div className="ejercicio-imagen-cell">
          {item.imagen ? (
            <img
              src={getImageUrl(item.imagen)}
              alt={item.nombre}
              className="ejercicio-imagen"
            />
          ) : (
            <div className="no-image-placeholder">
              <i className="fas fa-image no-image-icon"></i>
              <span className="no-image-text">Sin imagen</span>
            </div>
          )}
        </div>
      ),
      sortable: false,
    },
    {
      title: "Nombre",
      key: "nombre",
      render: (item: EjercicioType) => (
        <div className="ejercicio-nombre-cell">{item.nombre}</div>
      ),
      sortable: true,
    },
    {
      title: "Descripción",
      key: "descripcion",
      render: (item: EjercicioType) => (
        <div className="ejercicio-descripcion-cell">{item.descripcion}</div>
      ),
      sortable: false,
    },
    {
      title: "Acciones",
      key: "actions",
      render: (item: EjercicioType) => (
        <div className="ejercicio-acciones-cell">
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
        </div>
      ),
      sortable: false,
    },
  ];

  const ejercicioAlumnoColumns = [
    {
      title: "Ejercicio",
      key: "ejercicio",
      render: (item: EjercicioAlumnoType) => {
        const ejercicio = ejercicios.find((e) => e.id === item.ejercicio);
        return (
          <div className="ejercicio-imagen-small-cell">
            {ejercicio?.imagen ? (
              <img
                src={getImageUrl(ejercicio.imagen)}
                alt={ejercicio?.nombre || ""}
                className="ejercicio-imagen-small"
                title={ejercicio?.nombre || ""}
              />
            ) : (
              <div
                className="no-image-placeholder-small"
                title={ejercicio?.nombre || ""}
              >
                <i className="fas fa-image no-image-icon-small"></i>
              </div>
            )}
          </div>
        );
      },
      sortable: false,
    },
    {
      title: "Alumno",
      key: "alumno",
      render: (item: EjercicioAlumnoType) => {
        const alumno = alumnos.find((a) => a.id === item.alumno);
        return (
          <div className="alumno-cell">
            {alumno ? alumno.nombre_apellido : `ID: ${item.alumno}`}
          </div>
        );
      },
      sortable: false,
    },
    {
      title: "Peso Alumno (kg)",
      key: "peso_alumno",
      render: (item: EjercicioAlumnoType) => {
        const alumno = alumnos.find((a) => a.id === item.alumno);
        return (
          <div className="peso-alumno-cell">
            {alumno && alumno.peso ? alumno.peso : "N/A"}
          </div>
        );
      },
      sortable: false,
    },
    {
      title: "Peso Repetición Máxima (kg)",
      key: "peso_repeticion_maxima",
      render: (item: EjercicioAlumnoType) => (
        <div className="peso-cell">{item.peso_repeticion_maxima}</div>
      ),
      sortable: true,
    },
    {
      title: "Fuerza Relativa",
      key: "fuerza_relativa",
      render: (item: EjercicioAlumnoType) => {
        const relativeStrength = calculateRelativeStrength(item);
        return (
          <div className="fuerza-relativa-cell">
            {relativeStrength.toFixed(2)}
          </div>
        );
      },
      sortable: true,
    },
    {
      title: "Fecha",
      key: "fecha",
      render: (item: EjercicioAlumnoType) => (
        <div className="fecha-cell">{formatDateToDDMMYYYY(item.fecha)}</div>
      ),
      sortable: true,
    },
    {
      title: "Acciones",
      key: "actions",
      render: (item: EjercicioAlumnoType) => (
        <div className="action-buttons-container">
          <div className="buttons is-centered">
            <button
              className="button is-small is-info mr-2"
              onClick={() => openEditEjercicioAlumnoModal(item)}
            >
              <span className="icon is-small">
                <i className="fas fa-edit"></i>
              </span>
              <span>Editar</span>
            </button>
            <button
              className="button is-small is-danger"
              onClick={() => handleDeleteEjercicioAlumno(item.id)}
            >
              <span className="icon is-small">
                <i className="fas fa-trash"></i>
              </span>
              <span>Eliminar</span>
            </button>
          </div>
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

    // Filter by ejercicio if a specific one is selected
    if (
      filteredEjercicioId !== "all" &&
      record.ejercicio !== filteredEjercicioId
    ) {
      return false;
    }

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

  const handleSortRecord = (key: keyof EjercicioAlumnoType | string) => {
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
          ? () =>
              handleSortRecord(column.key as keyof EjercicioAlumnoType | string)
          : undefined,
        style: column.sortable ? { cursor: "pointer" } : undefined,
      },
    })
  );

  // Sort the filtered records based on sortKeyRecord and sortDirection
  const sortedEjercicioAlumnos = [...filteredEjercicioAlumnos].sort((a, b) => {
    if (sortKeyRecord === "fuerza_relativa") {
      const strengthA = calculateRelativeStrength(a);
      const strengthB = calculateRelativeStrength(b);
      return sortDirection === "asc"
        ? strengthA - strengthB
        : strengthB - strengthA;
    } else if (sortKeyRecord && sortKeyRecord in a) {
      // Handle other sortable fields
      const valueA = a[sortKeyRecord as keyof EjercicioAlumnoType];
      const valueB = b[sortKeyRecord as keyof EjercicioAlumnoType];

      if (typeof valueA === "number" && typeof valueB === "number") {
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
      } else if (typeof valueA === "string" && typeof valueB === "string") {
        return sortDirection === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
    }
    return 0;
  });

  // Function to handle change in the ejercicio filter
  const handleEjercicioFilterChange = (value: number) => {
    setFilteredEjercicioId(value === -1 ? "all" : value);
  };

  // Create options array with "Todos los ejercicios" as a selectable option
  const ejercicioOptions = [
    { value: -1, label: "Todos los ejercicios" },
    ...ejercicios.map((ejercicio) => ({
      value: ejercicio.id,
      label: ejercicio.nombre,
    })),
  ];

  // Function to handle tab switching
  const handleTabChange = (tab: TabOption) => {
    setActiveTab(tab);
  };

  return (
    <div>
      <Nabvar />
      {/* <div className="title-container">
        <h1 className="title big-title is-family-sans-serif">Ejercicios</h1>
      </div> */}

      {/* Tabs navigation */}
      <div className="tabs-container">
        <div className="tabs is-centered is-boxed is-medium">
          <ul>
            <li
              className={
                activeTab === TabOption.EJERCICIOS_ALUMNO ? "is-active" : ""
              }
            >
              <a onClick={() => handleTabChange(TabOption.EJERCICIOS_ALUMNO)}>
                <span className="icon is-small">
                  <i className="fas fa-clipboard-list" aria-hidden="true"></i>
                </span>
                <span>Ejercicios por Alumno</span>
              </a>
            </li>
            <li
              className={
                activeTab === TabOption.GESTION_EJERCICIOS ? "is-active" : ""
              }
            >
              <a onClick={() => handleTabChange(TabOption.GESTION_EJERCICIOS)}>
                <span className="icon is-small">
                  <i className="fas fa-dumbbell" aria-hidden="true"></i>
                </span>
                <span>Gestión de Ejercicios</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Tab content */}
      <div className="tab-content">
        {/* Ejercicio Alumnos Section */}
        {activeTab === TabOption.EJERCICIOS_ALUMNO && (
          <section className="section">
            <div className="ejercicio-filter-wrapper">
              <Select
                options={ejercicioOptions}
                selectedValue={
                  filteredEjercicioId === "all" ? -1 : filteredEjercicioId
                }
                onChange={handleEjercicioFilterChange}
                label=""
                placeholder=""
                includeDefaultOption={false}
                className="is-normal"
              />
            </div>

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
                items={sortedEjercicioAlumnos}
                columns={ejercicioAlumnoColumnsWithProps}
                className="is-fullwidth is-striped is-hoverable is-bordered"
              />
            </div>
          </section>
        )}

        {/* Ejercicios Section */}
        {activeTab === TabOption.GESTION_EJERCICIOS && (
          <section className="section">
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
        )}
      </div>

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

      <Loading isLoading={loading} />

      <Footer />
    </div>
  );
}

export default EjerciciosPage;
