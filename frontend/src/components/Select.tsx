import "../styles/Select.css";

interface SelectProps {
  options: { value: number; label: string }[];
  selectedValue: number;
  onChange: (value: number) => void;
  label: string;
  className?: string; // Add className prop
}

const Select: React.FC<SelectProps> = ({
  options,
  selectedValue,
  onChange,
  label,
  className,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(event.target.value, 10);
    onChange(value);
  };

  return (
    <div className="field">
      <label className="label">{label}</label>
      <div className="control">
        <div className={`select is-accent ${className || ""}`}>
          {" "}
          <select value={selectedValue} onChange={handleChange}>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
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
