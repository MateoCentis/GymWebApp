import React from "react";
import "../styles/NumberInput.css";

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max,
}) => {
  return (
    <div className="field">
      <label className="label has-text-light has-text-weight-semibold">
        {label}
      </label>
      <div className="control">
        <input
          className="input is-rounded is-medium stylish-input"
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          min={min}
          max={max}
          step="1"
          style={{ width: "300px" }}
        />
      </div>
    </div>
  );
};

export default NumberInput;
