import React from "react";
import "../styles/Loading.css";

interface LoadingProps {
  isLoading: boolean;
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({
  isLoading,
  message = "Cargando...",
}) => {
  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner-circle"></div>
          <div className="spinner-circle-inner"></div>
        </div>
        <p className="loading-text">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
