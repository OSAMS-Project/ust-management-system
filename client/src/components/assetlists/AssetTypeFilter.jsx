import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';

const AssetTypeFilter = ({ selectedFilter, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const filterOptions = {
    all: 'All Assets',
    consumable: 'Consumable',
    'non-consumable': 'Non-Consumable'
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value) => {
    onFilterChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-yellow-400 border border-black text-black px-4 py-2 rounded hover:bg-yellow-300 transition-colors duration-300 flex items-center justify-between w-[140px]"
      >
        <span className="text-black truncate">{filterOptions[selectedFilter]}</span>
        <span className="ml-2">▼</span>
      </Button>

      {isOpen && (
        <div className="absolute z-10 w-[140px] mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          {Object.entries(filterOptions).map(([value, label]) => (
            <div
              key={value}
              className={`px-3 py-1 cursor-pointer hover:bg-yellow-100 ${
                selectedFilter === value ? 'bg-yellow-200' : ''
              } truncate`}
              onClick={() => handleSelect(value)}
            >
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssetTypeFilter; 