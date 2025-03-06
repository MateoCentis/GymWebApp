import React, { useState, useEffect } from "react";
import { EjercicioType } from "../types";
import api from "../api";

interface EjercicioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: FormData) => void;
  onEdit: (id: number, data: FormData) => void;
  ejercicioToEdit: EjercicioType | null;
}

const EjercicioModal: React.FC<EjercicioModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  onEdit,
  ejercicioToEdit,
}) => {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);

  // Helper function to get the correct image URL
  const getImageUrl = (path: string | null) => {
    if (!path) return null;

    // If the path already includes the full URL, return it as is
    if (path.startsWith("http")) {
      return path;
    }

    // If the path is just the relative path, prepend the base URL
    return `${api.defaults.baseURL}${path}`;
  };

  useEffect(() => {
    if (ejercicioToEdit) {
      setNombre(ejercicioToEdit.nombre);
      setDescripcion(ejercicioToEdit.descripcion);

      // Use the helper function to get the correct image URL
      setImagenPreview(getImageUrl(ejercicioToEdit.imagen));
    } else {
      // Reset form for create mode
      setNombre("");
      setDescripcion("");
      setImagen(null);
      setImagenPreview(null);
    }
  }, [ejercicioToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    if (imagen) {
      formData.append("imagen", imagen);
    }

    if (ejercicioToEdit) {
      onEdit(ejercicioToEdit.id, formData);
    } else {
      onCreate(formData);
    }

    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImagen(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">
            {ejercicioToEdit ? "Editar Ejercicio" : "Nuevo Ejercicio"}
          </p>
          <button
            className="delete"
            aria-label="close"
            onClick={onClose}
          ></button>
        </header>
        <section className="modal-card-body">
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="label">Nombre</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  placeholder="Nombre del ejercicio"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="label">Descripción</label>
              <div className="control">
                <textarea
                  className="textarea"
                  placeholder="Descripción del ejercicio"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="label">Imagen</label>
              <div className="file has-name is-fullwidth">
                <label className="file-label">
                  <input
                    className="file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <span className="file-cta">
                    <span className="file-icon">
                      <i className="fas fa-upload"></i>
                    </span>
                    <span className="file-label">Seleccionar imagen</span>
                  </span>
                  <span className="file-name">
                    {imagen ? imagen.name : "Ningún archivo seleccionado"}
                  </span>
                </label>
              </div>
            </div>

            <div className="field is-grouped">
              <div className="control">
                <button className="button is-primary" type="submit">
                  {ejercicioToEdit ? "Guardar Cambios" : "Crear Ejercicio"}
                </button>
              </div>
              <div className="control">
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

export default EjercicioModal;
