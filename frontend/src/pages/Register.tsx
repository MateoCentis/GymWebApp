import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Loading from "../components/Loading";
import Form from "../components/Form";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/users/", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      navigate("/login");
    } catch (err: any) {
      if (err.response && err.response.data) {
        // Format Django REST Framework errors
        const serverErrors = err.response.data;
        const errorMessages = [];

        for (const field in serverErrors) {
          errorMessages.push(`${field}: ${serverErrors[field].join(" ")}`);
        }

        setError(errorMessages.join(". "));
      } else {
        setError("Error al registrar usuario. Por favor intente más tarde.");
      }
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Form route="/api/user/register/" method="register" />
      <Loading isLoading={loading} message="Registrando usuario..." />
    </div>
  );
}

export default Register;
