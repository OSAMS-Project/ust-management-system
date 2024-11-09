import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faColumns, faFileExport } from "@fortawesome/free-solid-svg-icons";
import { CSVLink } from "react-csv";

const TableControls = ({ onToggleColumns, prepareCSVData }) => {
  return (
    <div className="mb-4 flex justify-end space-x-2">
      <button
        onClick={onToggleColumns}
        className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 shadow-md flex items-center justify-center"
        title="Toggle column visibility"
      >
        <FontAwesomeIcon icon={faColumns} className="text-lg" />
      </button>
      <CSVLink
        data={prepareCSVData()}
        filename={"asset_data.csv"}
        className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-all duration-300 shadow-md flex items-center justify-center"
        title="Export to CSV"
      >
        <FontAwesomeIcon icon={faFileExport} className="text-lg" />
      </CSVLink>
    </div>
  );
};

export default TableControls; 