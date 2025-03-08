import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import Loading from "../components/Loading";
import Form from "../components/Form";

function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post("/auth/token/", credentials);
      localStorage.setItem("token", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.access}`;
      navigate("/");
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setError("Credenciales inválidas. Por favor intente nuevamente.");
      } else {
        setError("Error al iniciar sesión. Por favor intente más tarde.");
      }
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Form route="/api/token/" method="login" />
      <Loading isLoading={loading} message="Iniciando sesión..." />
    </div>
  );
}

export default Login;
