import React, { ChangeEvent } from "react";

interface AimeInputProps {
  value: string;
  onValueChange: (newValue: string) => void;
  required: boolean;
  id?: string;
}

const AimeInput = ({ value, onValueChange, required, id }: AimeInputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    if (/^\d{1,3}$/.test(newValue) || newValue === "") {
      newValue = newValue === "" ? "" : String(Number(newValue));
      onValueChange(newValue);
    }
  };

  return (
    <input
      id={id}
      name="answer"
      type="text"
      value={value}
      onChange={handleChange}
      placeholder="Enter a number (0-999)"
      className="w-full rounded-md bg-slate-50"
      required={required}
    />
  );
};

export default AimeInput;
