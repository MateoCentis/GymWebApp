import { useState } from "react";

interface SearchBarProps {
  onSearch: (searchTerm: string) => void;
  placeholder?: string;
  className?: string;
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
    onSearch(event.target.value);
  };

  return (
    <div
      className={`field has-addons ${className || ""}`}
      style={{ width: "100%" }}
    >
      <div className="control is-expanded has-icons-left has-icons-right">
        <input
          className="input is-medium"
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
        />
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
