import React from 'react';

const SelectField = ({
  label,
  value,
  onChange,
  options = [],
  className,
  shake,
}) => {
  const safeOptions = Array.isArray(options) ? options : [];

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className={`border p-2 rounded w-full ${className} ${shake ? "border-red-500 shake" : ""}`}
      >
        <option value="">Select {label}</option>
        {safeOptions.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
