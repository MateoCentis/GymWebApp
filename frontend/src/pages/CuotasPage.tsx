import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import Select from "../components/Select";
import NumberInput from "../components/NumberInput";

import "../styles/Title.css";
import "../styles/CuotasPage.css";
import Footer from "../components/Footer";
import { CuotaType, CuotaAlumnoType, AlumnoType } from "../types";
import Loading from "../components/Loading";

function CuotaPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [cuotas, setCuotas] = useState<CuotaType[]>([]);
  const [cuotaAlumnos, setCuotaAlumnos] = useState<CuotaAlumnoType[]>([]);
  const [unpaidAlumnos, setUnpaidAlumnos] = useState<AlumnoType[]>([]);
  const [selectedCuota, setSelectedCuota] = useState<CuotaType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch cuotas, cuotaAlumnos and Alumnos que no pagaron
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch cuotas
      const cuotasResponse = await api.get(
        `api/cuotas/?year=${year}&month=${month}`
      );
      setCuotas(cuotasResponse.data);
      const currentCuota = cuotasResponse.data.find(
        (c: CuotaType) => c.year === year && c.month === month
      );
      setSelectedCuota(currentCuota || null);

      // Fetch cuotaAlumnos
      const cuotaAlumnosResponse = await api.get(`api/cuotasalumno/`);
      setCuotaAlumnos(cuotaAlumnosResponse.data);

      // Fetch unpaid students if cuota exists
      if (currentCuota) {
        const unpaidResponse = await api.get(
          `api/cuotas/${currentCuota.id}/unpaid-students/`
        );
        setUnpaidAlumnos(unpaidResponse.data);
      } else {
        setUnpaidAlumnos([]);
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // const fetchCuotas = async () => {
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const cuotasResponse = await api.get(
  //       `api/cuotas/?year=${year}&month=${month}`
  //     ); // Filter by year and month
  //     setCuotas(cuotasResponse.data);

  //     const cuotaAlumnosResponse = await api.get(
  //       `api/cuotasalumno/?cuota__year=${year}&cuota__month=${month}`
  //     ); // Filter by year and month
  //     setCuotaAlumnos(cuotaAlumnosResponse.data);
  //   } catch (err: any) {
  //     setError(err.message); // Or a more user-friendly message
  //     console.error("Error fetching cuotas:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Registrar un pago de una cuota
  const registerPayment = async (alumnoId: number, plan: 2 | 3 | 4 | 5) => {
    if (!selectedCuota) return;
    try {
      const paymentData = {
        alumno: alumnoId,
        cuota: selectedCuota.id,
        pagada: true,
        plan: plan,
        fecha_pago: new Date().toISOString().split("T")[0], // Current date
        descuento: 0,
      };
      const response = await api.post(`api/cuotasalumno/`, paymentData);
      setCuotaAlumnos([...cuotaAlumnos, response.data]);
      setUnpaidAlumnos(unpaidAlumnos.filter((a) => a.id !== alumnoId));
    } catch (err: any) {
      setError("Error registering payment: " + err.message);
    }
  };

  // Manejar cambio de cuota
  const updateCuota = async (updatedCuota: CuotaType) => {
    if (!selectedCuota) return;
    try {
      await api.put(`api/cuotas/${selectedCuota.id}/`, updatedCuota);
      setCuotas(
        cuotas.map((c) => (c.id === selectedCuota.id ? updatedCuota : c))
      );
      setSelectedCuota(updatedCuota);
    } catch (err: any) {
      setError("Error updating cuota: " + err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year, month]);

  const handleYearChange = (selectedYear: number) => {
    setYear(selectedYear);
  };

  const handleMonthChange = (selectedMonth: number) => {
    setMonth(selectedMonth);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const yearOptions = years.map((y) => ({ value: y, label: y.toString() }));

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const monthOptions = months.map((m, i) => ({
    value: m,
    label: monthNames[i],
  }));

  const currentCuota = cuotas.find((c) => c.year === year && c.month === month);

  if (loading) return <Loading isLoading={loading} />;
  if (error) return <div>Error: {error}</div>;

  // Calculate statistics
  const currentCuotaAlumnos = cuotaAlumnos.filter(
    (ca) => selectedCuota && ca.cuota === selectedCuota.id
  );
  const totalAlumnos = currentCuotaAlumnos.length + unpaidAlumnos.length;
  const alumnosPagaron = currentCuotaAlumnos.filter((ca) => ca.pagada).length;
  const porcentajePagado =
    totalAlumnos > 0 ? (alumnosPagaron / totalAlumnos) * 100 : 0;
  const ingresos = currentCuotaAlumnos.reduce(
    (sum, ca) => sum + (ca.monto_pagado || 0),
    0
  );

  return (
    <div>
      {/* Navbar, título y selects */}
      <Navbar />
      <div className="title-container">
        <h1 className="title big-title is-family-sans-serif">Cuotas</h1>
      </div>
      <div className="parent-selects-container">
        <div className="selects-container">
          <Select
            options={yearOptions}
            selectedValue={year}
            onChange={handleYearChange}
            label="Año"
            className="is-medium"
          />
          <Select
            options={monthOptions}
            selectedValue={month}
            onChange={handleMonthChange}
            label="Mes"
            className="is-medium"
          />
        </div>
      </div>

      {/* Cards de meses */}
      <div className="months-grid">
        {months.map((m, i) => (
          <div
            key={m}
            className={`month-card ${month === m ? "selected-month" : ""}`}
            onClick={() => handleMonthChange(m)}
          >
            <div className="card">
              <div className="card-content">
                <p className="month-name">{monthNames[i]}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modify Cuota Section */}
      {selectedCuota && (
        <div className="box has-text-light">
          <h3 className="title is-5 has-text-info">Modificar Cuota</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateCuota(selectedCuota);
            }}
            className="modify-cuota-form"
          >
            <div className="field is-grouped is-align-items-center">
              <NumberInput
                label="2 días"
                value={selectedCuota.monto_dos_dias}
                onChange={(value) =>
                  setSelectedCuota({ ...selectedCuota, monto_dos_dias: value })
                }
              />
              <NumberInput
                label="3 días"
                value={selectedCuota.monto_tres_dias}
                onChange={(value) =>
                  setSelectedCuota({ ...selectedCuota, monto_tres_dias: value })
                }
              />
              <NumberInput
                label="4 días"
                value={selectedCuota.monto_cuatro_dias}
                onChange={(value) =>
                  setSelectedCuota({
                    ...selectedCuota,
                    monto_cuatro_dias: value,
                  })
                }
              />
              <NumberInput
                label="5 días"
                value={selectedCuota.monto_cinco_dias}
                onChange={(value) =>
                  setSelectedCuota({
                    ...selectedCuota,
                    monto_cinco_dias: value,
                  })
                }
              />
              <div className="control">
                <button
                  className="button ml-3 is-responsive is-primary"
                  type="submit"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="box">
        <h2 className="title is-4">
          Resumen de pagos - {monthNames[month - 1]} {year}
        </h2>
        <p>
          <strong>Total alumnos:</strong> {totalAlumnos}
        </p>
        <p>
          <strong>Alumnos que pagaron:</strong> {alumnosPagaron} (
          {porcentajePagado.toFixed(2)}%)
        </p>
        <p>
          <strong>Ingresos del mes:</strong> ${ingresos}
        </p>
      </div>

      {/* Display Paid and Unpaid Students */}
      <div className="columns">
        <div className="column">
          <h3 className="title is-5">Pagaron</h3>
          <ul>
            {currentCuotaAlumnos
              .filter((ca) => ca.pagada)
              .map((ca) => (
                <li key={ca.id}>
                  {/* Fetch Alumno name via separate API call or adjust backend to populate */}
                  Alumno ID: {ca.alumno} - ${ca.monto_pagado}
                </li>
              ))}
          </ul>
        </div>
        <div className="column">
          <h3 className="title is-5">No Pagaron</h3>
          <ul>
            {unpaidAlumnos.map((alumno) => (
              <li key={alumno.id}>
                {alumno.nombre_apellido}
                <button
                  className="button is-success is-small ml-2"
                  onClick={() => registerPayment(alumno.id, 2)} // Default to 2-day plan, adjust as needed
                >
                  Registrar Pago
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default CuotaPage;
