import React, { ChangeEvent } from 'react';

interface AimeInputProps {
  value: string;
  onValueChange: (newValue: string) => void;
}

const AimeInput: React.FC<AimeInputProps> = ({ value, onValueChange }) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    if (/^\d{1,3}$/.test(newValue) || newValue === '') {
      newValue = newValue === '' ? '' : String(Number(newValue));
      onValueChange(newValue);
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder="Enter a number (0-999)"
    />
  );
}

export default AimeInput;
