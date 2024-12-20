import React from "react";
import { FaSearch } from "react-icons/fa";

const AssetSearchbar = ({ handleSearch }) => {
  return (
    <div className="w-full sm:w-[370px] h-[44px] flex-shrink-0 rounded-md border border-black bg-[#FEFEFE] flex items-center px-2.5">
      <FaSearch className="w-[24.484px] h-[22px] mr-2 text-[#ccc]" />
      <input
        type="text"
        placeholder="Search by Asset Name, Product Code, or Serial Number"
        className="text-[#787486] font-inter text-[14px] sm:text-[16px] font-normal leading-normal border-none outline-none w-full"
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
};

export default AssetSearchbar;
