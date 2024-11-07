import React from 'react';
import { FaSearch } from 'react-icons/fa';

const SupplierSearch = ({ handleSearch }) => {
  return (
    <div className="w-[335px] h-[44px] flex-shrink-0 rounded-md border border-[#9A93B3] bg-[rgb(254,254,254)] flex items-center px-2.5">
      <FaSearch className="w-[24.484px] h-[22px] mr-2 text-[#ccc]" />
      <input
        type="text"
        placeholder="Search for Suppliers"
        className="text-[#787486] font-inter text-[14px] font-normal leading-normal border-none outline-none w-full"
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
};

export default SupplierSearch;
