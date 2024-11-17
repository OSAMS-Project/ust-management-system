import React from 'react';

const Button = ({ className, onClick, children, variant = 'primary', size = 'medium', disabled = false }) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none";
  
  const variants = {
    primary: "bg-[#FEC000] text-black",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-50",
  };

  const sizes = {
    icon: "h-8 w-8",
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base",
  };

  const disabledStyles = "opacity-50 cursor-not-allowed";

  const buttonStyles = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${disabled ? disabledStyles : ""}
    ${className}
  `;

  return (
    <button
      className={buttonStyles}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
