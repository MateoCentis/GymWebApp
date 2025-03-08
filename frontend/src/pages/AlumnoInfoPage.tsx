import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Table from "../components/Table";
import Loading from "../components/Loading";
import {
  AlumnoType,
  CuotaAlumnoType,
  EjercicioAlumnoType,
  EjercicioType,
} from "../types";
import "../styles/AlumnoInfoPage.css";
import { formatDateToDDMMYYYY } from "../utils/dateUtils";

interface AlumnoDetailType extends AlumnoType {
  cuotas_alumno: (CuotaAlumnoType & {
    cuota_info?: {
      month: number;
      year: number;
    };
  })[];
  ejercicios_alumno: (EjercicioAlumnoType & {
    ejercicio_info?: {
      nombre: string;
      descripcion: string;
      imagen: string | null;
    };
  })[];
}

function AlumnoInfoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [alumno, setAlumno] = useState<AlumnoDetailType | null>(null);
  const [ejercicios, setEjercicios] = useState<EjercicioType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pagos"); // "pagos" or "ejercicios"

  useEffect(() => {
    const fetchAlumnoData = async () => {
      setLoading(true);
      try {
        // Fetch detailed alumno data
        const alumnoResponse = await api.get(`/api/alumnos/${id}/detail/`);
        setAlumno(alumnoResponse.data);

        // Fetch ejercicios for reference
        const ejerciciosResponse = await api.get("/api/ejercicios/");
        setEjercicios(ejerciciosResponse.data);
      } catch (err: any) {
        setError(`Error loading data: ${err.message}`);
        console.error("Error fetching alumno details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumnoData();
  }, [id]);

  const calculateAge = (fechaNacimiento: string | null): number | null => {
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

  const goBack = () => {
    navigate(-1);
  };

  // Table columns for pagos
  const pagosColumns = [
    {
      title: "Mes",
      key: "month",
      render: (
        item: CuotaAlumnoType & { cuota_info?: { month: number; year: number } }
      ) =>
        item.cuota_info
          ? `${item.cuota_info.month}/${item.cuota_info.year}`
          : "N/A",
    },
    {
      title: "Plan",
      key: "plan",
      render: (item: CuotaAlumnoType) => `${item.plan} días`,
    },
    {
      title: "Monto",
      key: "monto_pagado",
      render: (item: CuotaAlumnoType) => `$${item.monto_pagado || 0}`,
    },
    {
      title: "Estado",
      key: "pagada",
      render: (item: CuotaAlumnoType) =>
        item.pagada ? (
          <span className="tag is-success">Pagada</span>
        ) : (
          <span className="tag is-danger">Pendiente</span>
        ),
    },
    {
      title: "Fecha de Pago",
      key: "fecha_pago",
      render: (item: CuotaAlumnoType) =>
        item.fecha_pago ? formatDateToDDMMYYYY(item.fecha_pago) : "N/A",
    },
    {
      title: "Vencimiento",
      key: "fecha_vencimiento_cuota",
      render: (item: CuotaAlumnoType) =>
        item.fecha_vencimiento_cuota
          ? formatDateToDDMMYYYY(item.fecha_vencimiento_cuota)
          : "N/A",
    },
  ];

  // Table columns for ejercicios
  const ejerciciosColumns = [
    {
      title: "Ejercicio",
      key: "ejercicio_nombre",
      render: (
        item: EjercicioAlumnoType & { ejercicio_info?: { nombre: string } }
      ) =>
        item.ejercicio_info
          ? item.ejercicio_info.nombre
          : `ID: ${item.ejercicio}`,
    },
    {
      title: "Fecha",
      key: "fecha",
      render: (item: EjercicioAlumnoType) => formatDateToDDMMYYYY(item.fecha),
    },
    {
      title: "Peso (kg)",
      key: "peso_repeticion_maxima",
      render: (item: EjercicioAlumnoType) => item.peso_repeticion_maxima,
    },
  ];

  // Get ejercicio image URL
  const getImageUrl = (path: string | null): string | undefined => {
    if (!path) return undefined;
    if (path.startsWith("http")) return path;
    return `${api.defaults.baseURL}${path}`;
  };

  if (loading) return <Loading isLoading={loading} />;
  if (error) return <div className="notification is-danger">{error}</div>;
  if (!alumno)
    return <div className="notification is-warning">Alumno no encontrado</div>;

  return (
    <div>
      <Navbar />

      <div className="alumno-info-container">
        <div className="back-button-container">
          <button className="button is-info is-outlined" onClick={goBack}>
            <span className="icon">
              <i className="fas fa-arrow-left"></i>
            </span>
            <span>Volver</span>
          </button>
        </div>

        <div className="alumno-header">
          <h1 className="title">{alumno.nombre_apellido}</h1>
          <span
            className={`status-tag tag ${
              alumno.activo ? "is-success" : "is-danger"
            }`}
          >
            {alumno.activo ? "Activo" : "Inactivo"}
          </span>
        </div>

        <div className="alumno-details-card">
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Edad:</span>
              <span className="detail-value">
                {calculateAge(alumno.fecha_nacimiento)} años
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Teléfono:</span>
              <span className="detail-value">{alumno.telefono}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Peso:</span>
              <span className="detail-value">{alumno.peso} kg</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Altura:</span>
              <span className="detail-value">{alumno.altura} cm</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Fecha de Nacimiento:</span>
              <span className="detail-value">
                {alumno.fecha_nacimiento
                  ? formatDateToDDMMYYYY(alumno.fecha_nacimiento)
                  : "N/A"}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Sexo:</span>
              <span className="detail-value">
                {alumno.sexo === "M" ? "Masculino" : "Femenino"}
              </span>
            </div>
          </div>
        </div>

        <div className="tabs-container">
          <div className="tabs is-boxed">
            <ul>
              <li className={activeTab === "pagos" ? "is-active" : ""}>
                <a onClick={() => setActiveTab("pagos")}>
                  <span className="icon is-small">
                    <i className="fas fa-money-bill"></i>
                  </span>
                  <span>Historial de pagos</span>
                </a>
              </li>
              <li className={activeTab === "ejercicios" ? "is-active" : ""}>
                <a onClick={() => setActiveTab("ejercicios")}>
                  <span className="icon is-small">
                    <i className="fas fa-dumbbell"></i>
                  </span>
                  <span>Registros de ejercicios</span>
                </a>
              </li>
            </ul>
          </div>

          {activeTab === "pagos" && (
            <div className="tab-content">
              <h3 className="subtitle">Historial de Pagos</h3>
              {alumno.cuotas_alumno && alumno.cuotas_alumno.length > 0 ? (
                <Table
                  items={alumno.cuotas_alumno}
                  columns={pagosColumns}
                  className="is-fullwidth is-striped is-hoverable is-bordered"
                />
              ) : (
                <p className="has-text-centered">No hay registros de pagos</p>
              )}
            </div>
          )}

          {activeTab === "ejercicios" && (
            <div className="tab-content">
              <h3 className="subtitle">Registros de Ejercicios</h3>
              {alumno.ejercicios_alumno &&
              alumno.ejercicios_alumno.length > 0 ? (
                <div className="ejercicios-records">
                  {alumno.ejercicios_alumno.map((record) => (
                    <div key={record.id} className="ejercicio-record-card">
                      <div className="ejercicio-image-container">
                        {record.ejercicio_info?.imagen ? (
                          <img
                            src={getImageUrl(record.ejercicio_info.imagen)}
                            alt={record.ejercicio_info.nombre}
                            className="ejercicio-image"
                          />
                        ) : (
                          <div className="no-image-placeholder">
                            <i className="fas fa-image"></i>
                          </div>
                        )}
                      </div>
                      <div className="ejercicio-info">
                        <h4 className="ejercicio-name">
                          {record.ejercicio_info?.nombre ||
                            `Ejercicio ID: ${record.ejercicio}`}
                        </h4>
                        <p className="ejercicio-date">
                          <span className="icon">
                            <i className="fas fa-calendar"></i>
                          </span>
                          {formatDateToDDMMYYYY(record.fecha)}
                        </p>
                        <p className="ejercicio-weight">
                          <span className="icon">
                            <i className="fas fa-weight-hanging"></i>
                          </span>
                          {record.peso_repeticion_maxima} kg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="has-text-centered">
                  No hay registros de ejercicios
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default AlumnoInfoPage;
