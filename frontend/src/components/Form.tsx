import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import { Link } from "react-router-dom";
import "../styles/Form.css"; // Importamos los estilos

interface Props {
  route: string;
  method: string;
}

function Form({ route, method }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const name = method === "login" ? "Iniciar Sesión" : "Registrarse";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();

    try {
      const res = await api.post(route, { username, password });

      if (method === "login") {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="is-flex is-justify-content-center is-align-items-center auth-container">
      <div className="box">
        <h2 className="title has-text-centered form-title">{name}</h2>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <p className="control has-icons-left">
              <input
                className="input"
                type="text"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <span className="icon is-small is-left">
                <i className="fas fa-user"></i>
              </span>
            </p>
          </div>

          <div className="field">
            <div className="control has-icons-left">
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
              />
              <span className="icon is-small is-left">
                <i className="fas fa-lock"></i>
              </span>
            </div>
          </div>

          <div className="control">
            <button
              className="button is-link is-fullwidth"
              type="submit"
              disabled={loading}
              style={{ marginBottom: "5px" }}
            >
              {name}
            </button>
          </div>
        </form>

        {name === "Iniciar Sesión" && (
          <p className="has-text-centered has-text-grey">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="has-text-primary">
              Regístrate
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default Form;
