import React, { useState, useEffect } from "react";
import { EjercicioAlumnoType, EjercicioType, AlumnoType } from "../types";
import Select from "./Select";
import "../styles/EjercicioModal.css";

interface EjercicioAlumnoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: Omit<EjercicioAlumnoType, "id" | "fecha">) => void;
  onEdit: (data: Omit<EjercicioAlumnoType, "id" | "fecha">) => void;
  ejercicioAlumnoToEdit: EjercicioAlumnoType | null;
  ejercicios: EjercicioType[];
  alumnos: AlumnoType[];
}

const EjercicioAlumnoModal: React.FC<EjercicioAlumnoModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  onEdit,
  ejercicioAlumnoToEdit,
  ejercicios,
  alumnos,
}) => {
  const [alumnoId, setAlumnoId] = useState<number | undefined>(undefined);
  const [ejercicioId, setEjercicioId] = useState<number | undefined>(undefined);
  const [pesoRepMaxima, setPesoRepMaxima] = useState(0);

  // Reset form when opening the modal or changing the edit target
  useEffect(() => {
    if (ejercicioAlumnoToEdit) {
      // Editing mode - set values from the existing record
      setAlumnoId(ejercicioAlumnoToEdit.alumno);
      setEjercicioId(ejercicioAlumnoToEdit.ejercicio);
      setPesoRepMaxima(ejercicioAlumnoToEdit.peso_repeticion_maxima);
    } else if (isOpen) {
      // Create mode - set default values if available
      if (alumnos.length > 0) {
        setAlumnoId(alumnos[0].id);
      }
      if (ejercicios.length > 0) {
        setEjercicioId(ejercicios[0].id);
      }
      setPesoRepMaxima(0);
    }
  }, [ejercicioAlumnoToEdit, isOpen, alumnos, ejercicios]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (alumnoId === undefined) {
      alert("Por favor seleccione un alumno");
      return;
    }

    if (ejercicioId === undefined) {
      alert("Por favor seleccione un ejercicio");
      return;
    }

    const formData = {
      alumno: alumnoId,
      ejercicio: ejercicioId,
      peso_repeticion_maxima: pesoRepMaxima,
    };

    if (ejercicioAlumnoToEdit) {
      onEdit(formData);
    } else {
      onCreate(formData);
    }

    onClose();
  };

  if (!isOpen) return null;

  // Create options for select dropdowns
  const alumnoOptions = alumnos.map((alumno) => ({
    value: alumno.id,
    label: alumno.nombre_apellido,
  }));

  const ejercicioOptions = ejercicios.map((ejercicio) => ({
    value: ejercicio.id,
    label: ejercicio.nombre,
  }));

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">
            {ejercicioAlumnoToEdit
              ? "Editar Registro"
              : "Nuevo Registro de Ejercicio"}
          </p>
          <button
            className="delete"
            aria-label="close"
            onClick={onClose}
          ></button>
        </header>
        <section className="modal-card-body">
          <form onSubmit={handleSubmit}>
            <div className="field ejercicio-alumno-select">
              <label className="label">Alumno</label>
              <div className="control">
                <Select
                  options={alumnoOptions}
                  selectedValue={alumnoId}
                  onChange={setAlumnoId}
                  label=""
                  placeholder="Seleccione un alumno"
                />
              </div>
            </div>

            <div className="field ejercicio-alumno-select">
              <label className="label">Ejercicio</label>
              <div className="control">
                <Select
                  options={ejercicioOptions}
                  selectedValue={ejercicioId}
                  onChange={setEjercicioId}
                  label=""
                  placeholder="Seleccione un ejercicio"
                />
              </div>
            </div>

            <div className="field">
              <label className="label">Peso Repetición Máxima (kg)</label>
              <div className="control">
                <input
                  className="input"
                  type="number"
                  step="0.1"
                  value={pesoRepMaxima}
                  onChange={(e) =>
                    setPesoRepMaxima(parseFloat(e.target.value) || 0)
                  }
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="field">
              <div className="control has-text-centered">
                <button className="button is-primary" type="submit">
                  {ejercicioAlumnoToEdit
                    ? "Guardar Cambios"
                    : "Registrar Ejercicio"}
                </button>
              </div>
            </div>

            <div className="field">
              <div className="control has-text-centered">
                <button
                  className="button is-light"
                  type="button"
                  onClick={onClose}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default EjercicioAlumnoModal;
