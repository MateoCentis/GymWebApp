import { useState, useEffect } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loading from "../components/Loading";
import Select from "../components/Select";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import "../styles/Title.css";
import "../styles/DatosPage.css";
import { MonthlyData, ExerciseData } from "../types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function DatosPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Years for filtering charts
  const currentYear = new Date().getFullYear();
  const [availableYears, setAvailableYears] = useState<number[]>([currentYear]);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Chart data
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [exerciseStats, setExerciseStats] = useState<ExerciseData[]>([]);

  // date/time for the top of the page
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Update state variables - change monthIncome/monthPayment to yearIncome/yearPayment
  const [selectedYearIncome, setSelectedYearIncome] =
    useState<number>(currentYear);
  const [selectedYearPayment, setSelectedYearPayment] =
    useState<number>(currentYear);

  const [selectedExercise, setSelectedExercise] = useState<number | "all">(
    "all"
  );

  // Update current date/time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Load data on component mount and when year changes
  useEffect(() => {
    fetchData(selectedYear);
  }, [selectedYear]);

  const fetchData = async (year: number) => {
    setLoading(true);
    setError(null); // Clear previous errors

    try {
      // Try to get all years with data for the year selector
      try {
        const yearsResponse = await api.get("/api/stats/available-years/");
        if (yearsResponse.data && yearsResponse.data.years) {
          setAvailableYears(yearsResponse.data.years);
        } else {
          // If no years returned, use current year
          setAvailableYears([currentYear]);
        }
      } catch (err) {
        console.warn("Could not fetch available years, using current year");
        setAvailableYears([currentYear]);
      }

      // Try to get all required data
      let hasError = false;

      try {
        const monthlyDataResponse = await api.get(
          `/api/stats/monthly-income/?year=${year}`
        );
        setMonthlyData(monthlyDataResponse.data || []);
      } catch (err) {
        console.error("Error fetching monthly income data:", err);
        hasError = true;
      }

      try {
        const exerciseStatsResponse = await api.get(
          `/api/stats/exercise-stats/?year=${year}`
        );
        setExerciseStats(exerciseStatsResponse.data || []);
      } catch (err) {
        console.error("Error fetching exercise stats data:", err);
        hasError = true;
      }

      if (hasError) {
        setError("Algunos datos no pudieron ser cargados");
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(
        `Los datos no pudieron ser cargados: ${
          err.message || "Error desconocido"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Handlers for year and month selection
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const handleYearIncomeChange = (year: number) => {
    setSelectedYearIncome(year);
  };

  const handleYearPaymentChange = (year: number) => {
    setSelectedYearPayment(year);
  };

  const handleExerciseChange = (exerciseIndex: number) => {
    setSelectedExercise(exerciseIndex === -1 ? "all" : exerciseIndex);
  };

  // Format data for charts based on selected filters

  // Format data for Income Line Chart
  const incomeData: ChartData<"line"> = {
    labels: monthlyData
      .filter((d) => d.year === selectedYearIncome)
      .map((d) => {
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
        return monthNames[d.month - 1];
      }),
    datasets: [
      {
        label: "Ingresos Mensuales ($)",
        data: monthlyData
          .filter((d) => d.year === selectedYearIncome)
          .map((d) => d.totalIncome),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Format data for Payment Percentage Bar Chart
  const paymentPercentageData: ChartData<"bar"> = {
    labels: monthlyData
      .filter((d) => d.year === selectedYearPayment)
      .map((d) => {
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
        return monthNames[d.month - 1];
      }),
    datasets: [
      {
        label: "Porcentaje de Pagos (%)",
        data: monthlyData
          .filter((d) => d.year === selectedYearPayment)
          .map((d) => d.paidPercentage),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgb(153, 102, 255)",
        borderWidth: 1,
      },
    ],
  };

  // Format data for Exercise Statistics Bar Chart - with exercise filter
  const filteredExerciseStats =
    selectedExercise === "all"
      ? exerciseStats
      : exerciseStats.filter((_, index) => index === selectedExercise);

  const exerciseStatsData: ChartData<"bar"> = {
    labels: filteredExerciseStats.map((d) => d.exerciseName),
    datasets: [
      {
        label: "Popularidad (# de registros)",
        data: filteredExerciseStats.map((d) => d.count),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgb(75, 192, 192)",
        borderWidth: 1,
        yAxisID: "y",
      },
      {
        label: "Peso Promedio (kg)",
        data: filteredExerciseStats.map((d) => d.averageWeight),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgb(153, 102, 255)",
        borderWidth: 1,
        yAxisID: "y1",
      },
    ],
  };

  // Setup options for selects
  const yearOptions = availableYears.map((year) => ({
    value: year,
    label: year.toString(),
  }));

  const exerciseOptions = [
    { value: -1, label: "Todos los ejercicios" },
    ...exerciseStats.map((exercise, index) => ({
      value: index,
      label: exercise.exerciseName,
    })),
  ];

  // Format date and time for header
  const formattedDate = currentDateTime.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const formattedTime = currentDateTime.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div>
      <Navbar />

      {/* Header with greeting and date/time */}
      <div className="stats-header">
        <div className="greeting">Hola profe!</div>
        <div className="date-time">
          {formattedDate} | {formattedTime}
        </div>
      </div>

      <div className="datos-container">
        <div className="year-selector-container">
          <Select
            options={yearOptions}
            selectedValue={selectedYear}
            onChange={handleYearChange}
            label="Año"
            className="is-medium"
            includeDefaultOption={false}
          />
        </div>

        {loading ? (
          <Loading isLoading={true} />
        ) : (
          <div>
            {/* Display any errors at the top but still show charts */}
            {error && (
              <div className="notification is-warning">
                <button
                  className="delete"
                  onClick={() => setError(null)}
                ></button>
                {error}
              </div>
            )}

            <div className="charts-container">
              {/* Income Line Chart - updated select styling */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3 className="chart-title">Ingresos Mensuales</h3>
                  <div className="chart-filter">
                    <Select
                      options={yearOptions}
                      selectedValue={selectedYearIncome}
                      onChange={handleYearIncomeChange}
                      label=""
                      className="chart-select"
                      includeDefaultOption={false}
                    />
                  </div>
                </div>
                <div className="chart-body">
                  <Line
                    data={incomeData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top",
                          labels: {
                            color: "#e0e0e0",
                          },
                        },
                        title: {
                          display: true,
                          text: `Ingresos Mensuales - ${selectedYearIncome}`,
                          color: "#e0e0e0",
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: "Monto ($)",
                            color: "#e0e0e0", // Light text for dark theme
                          },
                          ticks: {
                            color: "#e0e0e0", // Light text for dark theme
                          },
                          grid: {
                            color: "rgba(255, 255, 255, 0.1)", // Light grid lines
                          },
                        },
                        x: {
                          ticks: {
                            color: "#e0e0e0", // Light text for dark theme
                          },
                          grid: {
                            color: "rgba(255, 255, 255, 0.1)", // Light grid lines
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Payment Percentage Bar Chart - updated select styling */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3 className="chart-title">Porcentaje de Pagos por Mes</h3>
                  <div className="chart-filter">
                    <Select
                      options={yearOptions}
                      selectedValue={selectedYearPayment}
                      onChange={handleYearPaymentChange}
                      label=""
                      className="chart-select"
                      includeDefaultOption={false}
                    />
                  </div>
                </div>
                <div className="chart-body">
                  <Bar
                    data={paymentPercentageData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top",
                          labels: {
                            color: "#e0e0e0",
                          },
                        },
                        title: {
                          display: true,
                          text: `Porcentaje de Alumnos que Pagaron - ${selectedYearPayment}`,
                          color: "#e0e0e0",
                        },
                        tooltip: {
                          callbacks: {
                            afterLabel: function (context) {
                              const index = context.dataIndex;
                              const filteredData = monthlyData.filter(
                                (d) => d.year === selectedYearPayment
                              );
                              const { studentsWhoHavePaid, totalStudents } =
                                filteredData[index];
                              return `${studentsWhoHavePaid} de ${totalStudents} alumnos`;
                            },
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          title: {
                            display: true,
                            text: "Porcentaje (%)",
                            color: "#e0e0e0", // Light text for dark theme
                          },
                          ticks: {
                            color: "#e0e0e0", // Light text for dark theme
                          },
                          grid: {
                            color: "rgba(255, 255, 255, 0.1)", // Light grid lines
                          },
                        },
                        x: {
                          ticks: {
                            color: "#e0e0e0", // Light text for dark theme
                          },
                          grid: {
                            color: "rgba(255, 255, 255, 0.1)", // Light grid lines
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Exercise Statistics Bar Chart */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3 className="chart-title">Estadísticas de Ejercicios</h3>
                  <div className="chart-filter">
                    <Select
                      options={exerciseOptions}
                      selectedValue={
                        selectedExercise === "all" ? -1 : selectedExercise
                      }
                      onChange={handleExerciseChange}
                      label=""
                      className="chart-select"
                      includeDefaultOption={false}
                    />
                  </div>
                </div>
                <div className="chart-body">
                  <Bar
                    data={exerciseStatsData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top",
                          labels: {
                            color: "#e0e0e0", // Light text for dark theme
                          },
                        },
                        title: {
                          display: true,
                          text: `Popularidad y Peso Promedio de Ejercicios - ${selectedYear}`,
                          color: "#e0e0e0", // Light text for dark theme
                        },
                      },
                      scales: {
                        y: {
                          type: "linear",
                          position: "left",
                          title: {
                            display: true,
                            text: "Cantidad de Registros",
                            color: "#e0e0e0", // Light text for dark theme
                          },
                          beginAtZero: true,
                          ticks: {
                            color: "#e0e0e0", // Light text for dark theme
                          },
                          grid: {
                            color: "rgba(255, 255, 255, 0.1)", // Light grid lines
                          },
                        },
                        y1: {
                          type: "linear",
                          position: "right",
                          title: {
                            display: true,
                            text: "Peso Promedio (kg)",
                            color: "#e0e0e0", // Light text for dark theme
                          },
                          beginAtZero: true,
                          grid: {
                            drawOnChartArea: false,
                            color: "rgba(255, 255, 255, 0.1)", // Light grid lines
                          },
                          ticks: {
                            color: "#e0e0e0", // Light text for dark theme
                          },
                        },
                        x: {
                          ticks: {
                            color: "#e0e0e0", // Light text for dark theme
                          },
                          grid: {
                            color: "rgba(255, 255, 255, 0.1)", // Light grid lines
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default DatosPage;
