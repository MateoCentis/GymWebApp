import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
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
  // No se puede acceder a Home si no tenemos el token
  // Protected route puede ser usado para cualquier componente
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
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
