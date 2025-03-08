import "../styles/Select.css";

interface SelectProps {
  options: { value: number; label: string }[];
  selectedValue: number | undefined;
  onChange: (value: number) => void;
  label: string;
  placeholder?: string;
  className?: string;
  includeDefaultOption?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  selectedValue,
  onChange,
  label,
  placeholder = "Seleccione una opción",
  className,
  includeDefaultOption = true,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value)) {
      onChange(value);
    }
  };

  // Prepare options based on whether to include default placeholder option
  const allOptions = includeDefaultOption
    ? [{ value: -1, label: placeholder }, ...options]
    : options;

  return (
    <div className="field">
      <label className="label">{label}</label>
      <div className="control">
        <div className={`select is-accent ${className || ""}`}>
          <select
            value={selectedValue !== undefined ? selectedValue : -1}
            onChange={handleChange}
          >
            {allOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={includeDefaultOption && option.value === -1} // Only disable if it's the default placeholder option
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Select;
