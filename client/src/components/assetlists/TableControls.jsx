import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faColumns, faFileExport, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { CSVLink } from "react-csv";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import moment from "moment";

const TableControls = ({ onToggleColumns, prepareCSVData, assets, visibleColumns }) => {
  const generatePDF = () => {
    // Create new document
    const doc = new jsPDF();
    
    // Add title and date
    doc.setFontSize(18);
    doc.text("Assets Inventory Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${moment().format('MM/DD/YYYY HH:mm:ss')}`, 14, 30);

    // Prepare table headers and data
    const tableColumn = [];
    const tableRows = [];

    // Add visible columns to headers
    if (visibleColumns.id) tableColumn.push("ID");
    if (visibleColumns.productCode) tableColumn.push("Product Code");
    if (visibleColumns.dateCreated) tableColumn.push("Date Created");
    if (visibleColumns.asset) tableColumn.push("Asset Name");
    if (visibleColumns.costPerUnit) tableColumn.push("Cost per Unit");
    if (visibleColumns.quantity) tableColumn.push("Available Quantity");
    if (visibleColumns.totalCost) tableColumn.push("Total Cost");
    if (visibleColumns.borrow) tableColumn.push("Borrow Status");
    if (visibleColumns.quantityForBorrowing) tableColumn.push("Borrowing Quantity");
    if (visibleColumns.lastUpdated) tableColumn.push("Last Updated");

    // Add data rows
    assets.forEach(asset => {
      const rowData = [];
      if (visibleColumns.id) rowData.push(asset.asset_id);
      if (visibleColumns.productCode) rowData.push(asset.productCode);
      if (visibleColumns.dateCreated) rowData.push(moment(asset.createdDate).format("MM/DD/YYYY"));
      if (visibleColumns.asset) rowData.push(asset.assetName);
      if (visibleColumns.costPerUnit) rowData.push(`₱${parseFloat(asset.cost).toFixed(2)}`);
      if (visibleColumns.quantity) rowData.push(asset.quantity);
      if (visibleColumns.totalCost) rowData.push(`₱${(parseFloat(asset.cost) * asset.quantity).toFixed(2)}`);
      if (visibleColumns.borrow) rowData.push(asset.is_active ? "Active" : "Inactive");
      if (visibleColumns.quantityForBorrowing) rowData.push(asset.is_active ? asset.quantity_for_borrowing : "N/A");
      if (visibleColumns.lastUpdated) rowData.push(asset.lastUpdated ? moment(asset.lastUpdated).format("MM/DD/YYYY") : "N/A");
      
      tableRows.push(rowData);
    });

    // Generate the table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 6 },
      headStyles: { 
        fillColor: [0, 0, 0],
        textColor: [254, 192, 15],
        fontSize: 6,
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 40, left: 5, right: 5 }
    });

    // Save the PDF
    doc.save("assets-inventory.pdf");
  };

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
      <button
        onClick={generatePDF}
        className="p-2 rounded-full bg-yellow-400 border-2 border-black text-black hover:bg-yellow-300 duration-300 flex items-center justify-center"
        title="Export to PDF"
      >
        <FontAwesomeIcon icon={faFilePdf} className="text-lg" />
      </button>
    </div>
  );
};

export default TableControls; 