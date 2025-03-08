import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// Importe de páginas
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/HomePage";
import Cuotas from "./pages/CuotasPage";
import Datos from "./pages/DatosPage";
import EjerciciosPage from "./pages/EjerciciosPage";
import NotFound from "./pages/NotFound";
import AlumnoInfoPage from "./pages/AlumnoInfoPage";
// Importe de componentes
import ProtectedRoute from "./components/ProtectedRoute";
// Importe de estilos (importa el orden)
import "bulma/css/bulma.min.css";
import "./colors.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

function Logout() {
  localStorage.clear();
  return <Navigate to="/login" />;
}

// Wrapper: asegura al registrarse de
// limpiar tokens que puedan haber quedado
function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        {/* Register y login */}
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        {/* Navbar */}
        <Route path="/cuotas" element={<Cuotas />} />
        <Route path="/datos" element={<Datos />} />
        <Route path="/ejercicios" element={<EjerciciosPage />} />
        <Route path="/alumno/:id" element={<AlumnoInfoPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
