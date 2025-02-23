import React, { ChangeEvent } from "react";

interface IntegerInputProps {
  value: string;
  onValueChange: (newValue: string) => void;
  required: boolean;
}

const IntegerInput = ({
  value,
  onValueChange,
  required,
}: IntegerInputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    // Allow empty string, optional minus sign, followed by digits
    if (/^-?\d*$/.test(newValue)) {
      // Convert to number and back to string to normalize format
      // (e.g. remove leading zeros, but keep minus sign)
      newValue =
        newValue === "" || newValue === "-"
          ? newValue
          : String(Number(newValue));
      onValueChange(newValue);
    }
  };

  return (
    <input
      name="answer"
      type="text"
      value={value}
      onChange={handleChange}
      placeholder="Enter an integer"
      className="w-full rounded-md bg-slate-50"
      required={required}
    />
  );
};

export default IntegerInput;
