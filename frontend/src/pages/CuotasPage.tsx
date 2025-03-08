import React, { useState, useEffect } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import Select from "../components/Select";
import NumberInput from "../components/NumberInput";
import Table from "../components/Table";
import Loading from "../components/Loading";

import "../styles/Title.css";
import "../styles/CuotasPage.css";
import Footer from "../components/Footer";
import { CuotaType, CuotaAlumnoType, AlumnoType } from "../types";
import { formatDateToDDMMYYYY } from "../utils/dateUtils";

function CuotaPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [cuotas, setCuotas] = useState<CuotaType[]>([]);
  const [cuotaAlumnos, setCuotaAlumnos] = useState<CuotaAlumnoType[]>([]);
  const [unpaidAlumnos, setUnpaidAlumnos] = useState<AlumnoType[]>([]);
  const [selectedCuota, setSelectedCuota] = useState<CuotaType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "unpaid">(
    "all"
  );
  const [allAlumnos, setAllAlumnos] = useState<AlumnoType[]>([]);

  // This will store the unpaid table data with user-selected values for plan and discount
  const [unpaidTableData, setUnpaidTableData] = useState<any[]>([]);

  // Fetch cuotas, cuotaAlumnos and Alumnos que no pagaron
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all alumnos for reference
      const alumnosResponse = await api.get("/api/alumnos/");
      setAllAlumnos(alumnosResponse.data);

      // Fetch cuotas
      const cuotasResponse = await api.get(
        `/api/cuotas/?year=${year}&month=${month}`
      );
      setCuotas(cuotasResponse.data);
      const currentCuota = cuotasResponse.data.find(
        (c: CuotaType) => c.year === year && c.month === month
      );
      setSelectedCuota(currentCuota || null);

      // Fetch cuotaAlumnos
      const cuotaAlumnosResponse = await api.get("/api/cuotasalumno/");
      setCuotaAlumnos(cuotaAlumnosResponse.data);

      // Fetch unpaid students if cuota exists
      if (currentCuota) {
        const unpaidResponse = await api.get(
          `/api/cuotas/${currentCuota.id}/unpaid-students/`
        );
        setUnpaidAlumnos(unpaidResponse.data);

        // Initialize unpaid table data with default values
        setUnpaidTableData(
          unpaidResponse.data.map((alumno: AlumnoType) => ({
            id: 0, // Temporary ID for UI purposes
            alumnoId: alumno.id,
            nombre: alumno.nombre_apellido,
            pagada: false,
            descuento: 0,
            plan: 2, // Default plan
            monto_pagado: 0,
            fecha_pago: null,
            fecha_vencimiento: null,
            alumno: alumno,
          }))
        );
      } else {
        setUnpaidAlumnos([]);
        setUnpaidTableData([]);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(`Error cargando datos: ${err.message || "Error desconocido"}`);
    } finally {
      setLoading(false);
    }
  };

  // Registrar un pago de una cuota
  const registerPayment = async (
    alumnoId: number,
    plan: number,
    descuento: number = 0
  ) => {
    if (!selectedCuota) {
      setError("No hay cuota seleccionada para registrar el pago.");
      return;
    }

    try {
      setLoading(true);
      const paymentData = {
        alumno: alumnoId,
        cuota: selectedCuota.id,
        pagada: true,
        plan: plan,
        fecha_pago: new Date().toISOString().split("T")[0], // Current date
        descuento: descuento,
      };

      console.log("Sending payment data:", paymentData);
      const response = await api.post("/api/cuotasalumno/", paymentData);
      console.log("Payment response:", response.data);

      // Update the states
      setCuotaAlumnos([...cuotaAlumnos, response.data]);
      setUnpaidAlumnos(unpaidAlumnos.filter((a) => a.id !== alumnoId));
      setUnpaidTableData(
        unpaidTableData.filter((item) => item.alumnoId !== alumnoId)
      );
    } catch (err: any) {
      console.error("Error registering payment:", err);
      const errorMsg = err.response?.data
        ? JSON.stringify(err.response.data)
        : err.message || "Error desconocido";
      setError(`Error registrando pago: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to update existing payment
  const updatePayment = async (
    cuotaAlumnoId: number,
    updateData: Partial<CuotaAlumnoType>,
    originalItem: any
  ) => {
    try {
      setLoading(true);

      // Log the details to help debug API call issues
      console.log(`Updating payment ${cuotaAlumnoId}:`, updateData);

      // Make sure we include all required fields when updating
      const completeUpdateData = {
        ...updateData,
        // Include existing values for required fields if not provided in updateData
        plan: updateData.plan || originalItem.plan,
        alumno: updateData.alumno || originalItem.alumnoId,
        cuota: updateData.cuota || originalItem.cuotaAlumno.cuota,
      };

      console.log("Complete update data:", completeUpdateData);

      const response = await api.put(
        `/api/cuotasalumno/${cuotaAlumnoId}/`,
        completeUpdateData
      );

      console.log("Update payment response:", response.data);

      setCuotaAlumnos(
        cuotaAlumnos.map((ca) => (ca.id === cuotaAlumnoId ? response.data : ca))
      );

      // If we're marking a paid record as unpaid
      if (updateData.pagada === false) {
        const cuotaAlumno = cuotaAlumnos.find((ca) => ca.id === cuotaAlumnoId);
        if (cuotaAlumno) {
          // Add back to unpaid students list
          const alumno = allAlumnos.find((a) => a.id === cuotaAlumno.alumno);
          if (alumno) {
            setUnpaidAlumnos([...unpaidAlumnos, alumno]);

            // Add back to unpaid table data
            setUnpaidTableData([
              ...unpaidTableData,
              {
                id: 0,
                alumnoId: alumno.id,
                nombre: alumno.nombre_apellido,
                pagada: false,
                descuento: cuotaAlumno.descuento || 0,
                plan: cuotaAlumno.plan || 2,
                monto_pagado: 0,
                fecha_pago: null,
                fecha_vencimiento: null,
                alumno: alumno,
              },
            ]);
          }
        }
      }
    } catch (err: any) {
      // Improved error handling with response details if available
      console.error("Error updating payment:", err);
      const errorResponse = err.response?.data || {};
      let errorDetails = "";

      // Format error messages from Django validation errors
      if (typeof errorResponse === "object") {
        errorDetails = Object.entries(errorResponse)
          .map(([field, errors]) => `${field}: ${errors}`)
          .join(", ");
      } else {
        errorDetails = err.message || "Error desconocido";
      }

      const statusCode = err.response?.status ? `(${err.response.status})` : "";
      setError(`Error actualizando pago ${statusCode}: ${errorDetails}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a payment entry
  const deletePayment = async (cuotaAlumnoId: number) => {
    try {
      setLoading(true);

      // Log the details to help debug API call issues
      console.log(`Deleting payment ${cuotaAlumnoId}`);

      // Call the delete endpoint
      const response = await api.delete(`/api/cuotasalumno/${cuotaAlumnoId}/`);
      console.log("Delete payment response:", response.status);

      // Remove from cuotaAlumnos state
      setCuotaAlumnos(cuotaAlumnos.filter((ca) => ca.id !== cuotaAlumnoId));

      // Add the alumno back to unpaid list
      const cuotaAlumno = cuotaAlumnos.find((ca) => ca.id === cuotaAlumnoId);
      if (cuotaAlumno) {
        // Add back to unpaid students list
        const alumno = allAlumnos.find((a) => a.id === cuotaAlumno.alumno);
        if (alumno) {
          setUnpaidAlumnos([...unpaidAlumnos, alumno]);

          // Add back to unpaid table data
          setUnpaidTableData([
            ...unpaidTableData,
            {
              id: 0,
              alumnoId: alumno.id,
              nombre: alumno.nombre_apellido,
              pagada: false,
              descuento: cuotaAlumno.descuento || 0,
              plan: cuotaAlumno.plan || 2,
              monto_pagado: 0,
              fecha_pago: null,
              fecha_vencimiento: null,
              alumno: alumno,
            },
          ]);
        }
      }
    } catch (err: any) {
      // Improved error handling
      console.error("Error deleting payment:", err);
      const errorResponse = err.response?.data || {};
      let errorDetails = "";

      // Format error messages from Django validation errors
      if (typeof errorResponse === "object") {
        errorDetails = Object.entries(errorResponse)
          .map(([field, errors]) => `${field}: ${errors}`)
          .join(", ");
      } else {
        errorDetails = err.message || "Error desconocido";
      }

      const statusCode = err.response?.status ? `(${err.response.status})` : "";
      setError(`Error eliminando pago ${statusCode}: ${errorDetails}`);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de cuota
  const updateCuota = async (updatedCuota: CuotaType) => {
    if (!selectedCuota) return;
    try {
      setLoading(true);
      await api.put(`/api/cuotas/${selectedCuota.id}/`, updatedCuota);
      setCuotas(
        cuotas.map((c) => (c.id === selectedCuota.id ? updatedCuota : c))
      );
      setSelectedCuota(updatedCuota);
    } catch (err: any) {
      console.error("Error updating cuota:", err);
      setError(
        `Error actualizando cuota: ${err.message || "Error desconocido"}`
      );
    } finally {
      setLoading(false);
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

  const handleFilterChange = (value: number) => {
    if (value === 1) setFilterStatus("paid");
    else if (value === 2) setFilterStatus("unpaid");
    else setFilterStatus("all");
  };

  // Handler for plan change in unpaid records
  const handlePlanChange = (alumnoId: number, newPlan: number) => {
    setUnpaidTableData(
      unpaidTableData.map((item) =>
        item.alumnoId === alumnoId ? { ...item, plan: newPlan } : item
      )
    );
  };

  // Handler for discount change in unpaid records
  const handleDiscountChange = (alumnoId: number, newDiscount: number) => {
    setUnpaidTableData(
      unpaidTableData.map((item) =>
        item.alumnoId === alumnoId
          ? { ...item, descuento: isNaN(newDiscount) ? 0 : newDiscount }
          : item
      )
    );
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

  const filterOptions = [
    { value: 0, label: "Todos los alumnos" },
    { value: 1, label: "Alumnos que pagaron" },
    { value: 2, label: "Alumnos que no pagaron" },
  ];

  if (loading) return <Loading isLoading={loading} />;

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

  // Prepare table data
  const getAlumnoName = (alumnoId: number) => {
    const alumno = allAlumnos.find((a) => a.id === alumnoId);
    return alumno ? alumno.nombre_apellido : `Alumno ID: ${alumnoId}`;
  };

  // Prepare table data for paid records
  const paidTableData = currentCuotaAlumnos
    .filter((ca) => ca.pagada)
    .map((ca) => ({
      id: ca.id,
      alumnoId: ca.alumno,
      nombre: getAlumnoName(ca.alumno),
      pagada: true,
      descuento: ca.descuento,
      plan: ca.plan,
      monto_pagado: ca.monto_pagado,
      fecha_pago: ca.fecha_pago,
      fecha_vencimiento: ca.fecha_vencimiento_cuota,
      cuotaAlumno: ca,
    }));

  // Combine based on filter
  let tableData: any[] = [];

  if (filterStatus === "all") {
    tableData = [...paidTableData, ...unpaidTableData];
  } else if (filterStatus === "paid") {
    tableData = paidTableData;
  } else {
    tableData = unpaidTableData;
  }

  // Table columns
  const columns = [
    {
      title: "Alumno",
      key: "nombre",
      sortable: true,
    },
    {
      title: "Estado",
      key: "pagada",
      render: (item: any) => (
        <span className={`tag ${item.pagada ? "is-success" : "is-danger"}`}>
          {item.pagada ? "Pagado" : "Pendiente"}
        </span>
      ),
      sortable: false,
      headerProps: {
        "data-key": "pagada" as any,
      },
      cellProps: {
        "data-key": "pagada" as any,
      },
    },
    {
      title: "Plan",
      key: "plan",
      render: (item: any) => {
        if (item.pagada) {
          return <span>{item.plan} días</span>;
        } else {
          return (
            <div className="select is-small">
              <select
                value={item.plan}
                onChange={(e) => {
                  handlePlanChange(item.alumnoId, parseInt(e.target.value));
                }}
              >
                <option value={2}>2 días</option>
                <option value={3}>3 días</option>
                <option value={4}>4 días</option>
                <option value={5}>5 días</option>
              </select>
            </div>
          );
        }
      },
      sortable: false,
    },
    {
      title: "Descuento",
      key: "descuento",
      render: (item: any) => {
        if (item.pagada) {
          return <span>${item.descuento}</span>;
        } else {
          return (
            <input
              type="number"
              className="input is-small"
              placeholder="0"
              value={item.descuento}
              onChange={(e) => {
                handleDiscountChange(item.alumnoId, parseInt(e.target.value));
              }}
              min="0"
            />
          );
        }
      },
      sortable: false,
    },
    {
      title: "Monto Pagado",
      key: "monto_pagado",
      render: (item: any) => (item.pagada ? `$${item.monto_pagado}` : "-"),
      sortable: true,
    },
    {
      title: "Fecha de Pago",
      key: "fecha_pago",
      render: (item: any) =>
        item.fecha_pago ? formatDateToDDMMYYYY(item.fecha_pago) : "-",
      sortable: true,
    },
    {
      title: "Vencimiento",
      key: "fecha_vencimiento",
      render: (item: any) =>
        item.fecha_vencimiento
          ? formatDateToDDMMYYYY(item.fecha_vencimiento)
          : "-",
      sortable: true,
    },
    {
      title: "Acciones",
      key: "actions",
      render: (item: any) => {
        if (item.pagada) {
          return (
            <div className="buttons is-centered">
              <button
                className="button is-small is-danger"
                onClick={() => {
                  if (
                    item.cuotaAlumno &&
                    window.confirm(
                      "¿Estás seguro de eliminar este pago? Esta acción no se puede deshacer."
                    )
                  ) {
                    // Call deletePayment instead of updatePayment
                    deletePayment(item.id);
                  }
                }}
              >
                <span className="icon is-small">
                  <i className="fas fa-trash"></i>
                </span>
                <span>Eliminar Pago</span>
              </button>
            </div>
          );
        } else {
          return (
            <div className="buttons is-centered">
              <button
                className="button is-small is-success"
                onClick={() => {
                  registerPayment(item.alumnoId, item.plan, item.descuento);
                }}
              >
                <span className="icon is-small">
                  <i className="fas fa-check"></i>
                </span>
                <span>Registrar Pago</span>
              </button>
            </div>
          );
        }
      },
      sortable: false,
    },
  ];

  return (
    <div>
      {/* Navbar, título y selects */}
      <Navbar />
      {/* <div className="title-container">
        <h1 className="title big-title is-family-sans-serif">Cuotas</h1>
      </div> */}
      {error && (
        <div className="notification is-danger is-light">
          <button className="delete" onClick={() => setError(null)}></button>
          {error}
        </div>
      )}
      <div className="parent-selects-container">
        <div className="year-select-container">
          <Select
            options={yearOptions}
            selectedValue={year}
            onChange={handleYearChange}
            label="Año"
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
      {selectedCuota ? (
        <div className="box cuota-modify-box">
          <h3 className="title is-5 has-text-primary cuota-modify-title">
            Modificar Cuota
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateCuota(selectedCuota);
            }}
            className="modify-cuota-form"
          >
            <div className="cuota-inputs-container">
              <NumberInput
                label="2 días"
                value={selectedCuota.monto_dos_dias}
                onChange={(value) =>
                  setSelectedCuota({ ...selectedCuota, monto_dos_dias: value })
                }
                className="cuota-input"
              />
              <NumberInput
                label="3 días"
                value={selectedCuota.monto_tres_dias}
                onChange={(value) =>
                  setSelectedCuota({ ...selectedCuota, monto_tres_dias: value })
                }
                className="cuota-input"
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
                className="cuota-input"
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
                className="cuota-input"
              />
              <div className="control save-button-container">
                <button className="button is-primary" type="submit">
                  <span className="icon">
                    <i className="fas fa-save"></i>
                  </span>
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="notification is-warning cuota-warning">
          No existe una cuota para este mes. Por favor cree una.
          <button
            className="button is-primary ml-3"
            onClick={async () => {
              try {
                setLoading(true);
                // Default values for a new cuota
                const newCuota = {
                  year: year,
                  month: month,
                  monto_dos_dias: 0,
                  monto_tres_dias: 0,
                  monto_cuatro_dias: 0,
                  monto_cinco_dias: 0,
                };
                const res = await api.post("/api/cuotas/", newCuota);
                setCuotas([...cuotas, res.data]);
                setSelectedCuota(res.data);
              } catch (err: any) {
                console.error("Error creating cuota:", err);
                setError(
                  `Error creando cuota: ${err.message || "Error desconocido"}`
                );
              } finally {
                setLoading(false);
              }
            }}
          >
            Crear Cuota
          </button>
        </div>
      )}

      {/* Filter and Table Section */}
      <div className="box table-box">
        <div className="level">
          <div className="level-left">
            <div className="level-item">
              <h3 className="title is-5">Lista de Alumnos</h3>
            </div>
          </div>
          <div className="level-right">
            <div className="level-item">
              <Select
                options={filterOptions}
                selectedValue={
                  filterStatus === "all" ? 0 : filterStatus === "paid" ? 1 : 2
                }
                onChange={handleFilterChange}
                label="Filtrar por"
                className="is-normal"
                includeDefaultOption={false}
              />
            </div>
          </div>
        </div>

        <div className="table-container">
          <Table
            columns={columns}
            items={tableData}
            className="is-fullwidth is-striped is-hoverable is-bordered"
          />
        </div>
      </div>

      {/* Sección resumen mejorada */}
      <div className="box resumen-box">
        <h2 className="title is-4 has-text-centered resumen-title">
          Resumen de pagos - {monthNames[month - 1]} {year}
        </h2>
        <div className="columns resumen-cards">
          <div className="column">
            <div className="resumen-card total-alumnos">
              <div className="resumen-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="resumen-content">
                <p className="resumen-value">{totalAlumnos}</p>
                <p className="resumen-label">Total alumnos</p>
              </div>
            </div>
          </div>
          <div className="column">
            <div className="resumen-card alumnos-pagaron">
              <div className="resumen-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="resumen-content">
                <p className="resumen-value">
                  {alumnosPagaron} ({porcentajePagado.toFixed(2)}%)
                </p>
                <p className="resumen-label">Alumnos que pagaron</p>
              </div>
            </div>
          </div>
          <div className="column">
            <div className="resumen-card ingresos-mes">
              <div className="resumen-icon">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <div className="resumen-content">
                <p className="resumen-value">${ingresos}</p>
                <p className="resumen-label">Ingresos del mes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Loading isLoading={loading} />
      <Footer />
    </div>
  );
}

export default CuotaPage;
