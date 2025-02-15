import { useState } from "react";

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  className?: string; // Add className prop for customization
  leftIcon?: string;
  rightIcon?: string;
}

function SearchBar({
  onSearch,
  placeholder = "Buscar alumno",
  className,
  leftIcon,
  rightIcon,
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    onSearch(event.target.value); // Busca en cada cambio
  };

  return (
    <div className={`field has-addons ${className || ""}`}>
      {" "}
      <div className="control is-expanded has-icons-left has-icons-right">
        <input
          className="input is-rounded is-medium"
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
        />
        {/* Para el ícono solo poner lo que va después de fa- */}
        {leftIcon && (
          <span className="icon is-left">
            <i className={`fas fa-${leftIcon}`}></i>
          </span>
        )}
        {rightIcon && (
          <span className="icon is-right">
            <i className={`fas fa-${rightIcon}`}></i>
          </span>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
