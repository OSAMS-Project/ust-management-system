import React from 'react';

const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  readOnly = false,
  prefix,
  className,
  shake,
}) => (
  <div className="mb-4 relative">
    <label className="block text-sm font-medium mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className={`border p-2 rounded w-full ${prefix ? "pl-8" : ""} ${className} ${shake ? "border-red-500 shake" : ""}`}
      placeholder={prefix ? "" : label}
    />
    {prefix && (
      <span className="absolute left-2 top-1/2 transform -translate-y-2/2 text-black-500">
        {prefix}
      </span>
    )}
  </div>
);

export default InputField;
