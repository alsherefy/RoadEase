import React from 'react';

interface SelectProps {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  children,
  className = '',
  required = false,
  disabled = false,
  id,
  name,
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
        disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
      } ${className}`}
      required={required}
      disabled={disabled}
      id={id}
      name={name}
    >
      {children}
    </select>
  );
};

export default Select;