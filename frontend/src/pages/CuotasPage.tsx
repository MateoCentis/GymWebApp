import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import Select from "../components/Select";

import "../styles/Title.css";
import "../styles/CuotasPage.css";
import Footer from "../components/Footer";

function CuotaPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  // const [cuotas, setCuotas] = useState<CuotaType[]>([]);
  // const [cuotaAlumnos, setCuotaAlumnos] = useState<CuotaAlumnoType[]>([]);
  // const [alumnos, setAlumnos] = useState<AlumnoType[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  // const [searchTerm, setSearchTerm] = useState("");
  // const [sortKey, setSortKey] = useState<keyof AlumnoType | null>(null);
  // const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const fetchCuotas = async () => {};

  useEffect(() => {
    const fetchCuotas = async () => {
      // ... your fetch logic
    };

    fetchCuotas();
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

  return (
    <div>
      <Navbar />
      <div className="title-container">
        <h1 className="title is-family-sans-serif">Cuotas</h1>
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
      <Footer />
    </div>
  );
}

export default CuotaPage;
