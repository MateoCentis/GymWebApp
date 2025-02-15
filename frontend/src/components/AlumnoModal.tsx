import { useState, useEffect } from "react";
import { AlumnoType } from "../types";
import "../styles/AlumnoModal.css";

interface AlumnoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (
    alumno: Omit<
      AlumnoType,
      "id" | "edad" | "cuotas" | "ejercicios" | "agregado_por"
    >
  ) => Promise<void>;
  alumnoToEdit?: AlumnoType | null;
  onEdit?: (
    alumnoData: Omit<
      AlumnoType,
      "id" | "edad" | "cuotas" | "ejercicios" | "agregado_por"
    >
  ) => void;
  isCreating: boolean;
}

const AlumnoModal: React.FC<AlumnoModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  alumnoToEdit,
  onEdit,
  isCreating,
}) => {
  const [alumnoData, setAlumnoData] = useState<
    Omit<AlumnoType, "id" | "edad" | "cuotas" | "ejercicios" | "agregado_por">
  >({
    nombre_apellido: "",
    telefono: "",
    fecha_nacimiento: "",
    sexo: "M",
    peso: 0,
    altura: 0,
    activo: true,
  });

  useEffect(() => {
    if (isOpen) {
      // Runs whenever isOpen changes
      if (isCreating) {
        // Check the isCreating prop
        setAlumnoData({
          // Reset only when creating
          nombre_apellido: "",
          telefono: "",
          fecha_nacimiento: "",
          sexo: "M",
          peso: 0,
          altura: 0,
          activo: true,
        });
      } else if (alumnoToEdit) {
        // Editing
        setAlumnoData({
          nombre_apellido: alumnoToEdit.nombre_apellido,
          telefono: alumnoToEdit.telefono,
          fecha_nacimiento: alumnoToEdit.fecha_nacimiento,
          sexo: alumnoToEdit.sexo,
          altura: alumnoToEdit.altura,
          peso: alumnoToEdit.peso,
          activo: alumnoToEdit.activo,
        });
      }
    }
  }, [isOpen, isCreating, alumnoToEdit]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setAlumnoData({ ...alumnoData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (alumnoToEdit && onEdit) {
      onEdit(alumnoData);
    } else {
      onCreate(alumnoData);
    }
  };

  return (
    <div className={`modal ${isOpen ? "is-active" : ""}`}>
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">
            {alumnoToEdit ? "Editar alumno" : "Agregar Alumno"}
          </p>
          <button
            className="delete"
            aria-label="close"
            onClick={onClose}
          ></button>
        </header>
        <section className="modal-card-body">
          <form
            onSubmit={handleSubmit}
            style={{
              backgroundColor: "transparent",
            }}
          >
            {/* ... (Your form fields - same as before) */}
            <div className="field">
              <label className="label">Nombre y Apellido</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  name="nombre_apellido"
                  value={alumnoData.nombre_apellido}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label className="label">Teléfono</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  name="telefono"
                  value={alumnoData.telefono}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label className="label">Fecha de Nacimiento</label>
              <div className="control">
                <input
                  className="input"
                  type="date"
                  name="fecha_nacimiento"
                  value={alumnoData.fecha_nacimiento || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label className="label">Sexo</label>
              <div className="control">
                <select
                  className="input"
                  name="sexo"
                  value={alumnoData.sexo}
                  onChange={handleInputChange}
                >
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label className="label">Peso (kg)</label>
              <div className="control">
                <input
                  className="input"
                  type="number"
                  name="peso"
                  value={alumnoData.peso || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label className="label">Altura (cm)</label>
              <div className="control">
                <input
                  className="input"
                  type="number"
                  name="altura"
                  value={alumnoData.altura || ""}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="field is-grouped">
              <div className="control">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={alumnoData.activo}
                    onChange={(e) =>
                      setAlumnoData({ ...alumnoData, activo: e.target.checked })
                    }
                  />
                  <span className="ml-2">Activo</span>
                </label>
              </div>
            </div>
            <div className="field">
              <div className="control has-text-centered">
                <button type="submit" className="button is-primary">
                  {alumnoToEdit ? "Guardar Cambios" : "Agregar Alumno"}
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default AlumnoModal;
