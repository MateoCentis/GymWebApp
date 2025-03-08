import React from "react";

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onInfo?: () => void;
  showInfo?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onEdit,
  onDelete,
  onInfo,
  showInfo = false,
}) => {
  return (
    <div className="action-buttons-container">
      <div className="buttons is-centered">
        {showInfo && (
          <button className="button is-small is-primary mr-2" onClick={onInfo}>
            <span className="icon">
              <i className="fas fa-info-circle"></i>
            </span>
            <span>Info</span>
          </button>
        )}
        {onEdit && (
          <button className="button is-small is-info mr-2" onClick={onEdit}>
            <span className="icon">
              <i className="fas fa-edit"></i>
            </span>
            <span>Editar</span>
          </button>
        )}
        {onDelete && (
          <button className="button is-small is-danger" onClick={onDelete}>
            <span className="icon">
              <i className="fas fa-trash"></i>
            </span>
            <span>Eliminar</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ActionButtons;
