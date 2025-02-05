import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Chequear si estamos autorizados primero
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    auth().catch(() => setIsAuthorized(false));
  }, []);

  // Refresca el token (obtenemos -> mandamos un pedido al backend -> guardamos el nuevo token)
  // Si falla el pedido a la API o el token no es válido, fuira
  const refreshToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    try {
      // Hay que hablar con el backend para pedir un nuevo token
      const res = await api.post("/api/token/refresh/", {
        refresh: refreshToken,
      });
      if (res.status === 200) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error(error);
      setIsAuthorized(false);
    }
  };

  // Chequea si tenemos que refrescar el token
  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);

    // Validaciones
    if (!token) {
      // Si no tiene token no le damos acceso
      setIsAuthorized(false);
      return;
    }
    const decoded = jwtDecode(token);

    if (!decoded.exp) {
      setIsAuthorized(false);
      return;
    }
    const tokenExpiration = decoded.exp;

    const now = Math.floor(Date.now() / 1000);
    if (tokenExpiration < now) {
      // Si se venció lo refrescamos
      await refreshToken();
    } else {
      // Si no está vencido está todo OK
      setIsAuthorized(true);
    }
  };

  if (isAuthorized === null) {
    return <div>Cargando...</div>;
  }

  return isAuthorized ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;
