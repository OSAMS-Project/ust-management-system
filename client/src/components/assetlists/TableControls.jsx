import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faColumns, faFileExport, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { CSVLink } from "react-csv";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import moment from "moment";

const TableControls = ({ onToggleColumns, prepareCSVData, assets, visibleColumns }) => {
  const generateSummaryStats = (data) => {
    return {
      totalAssets: data.length,
      totalQuantity: data.reduce((sum, asset) => sum + (parseInt(asset.quantity) || 0), 0),
    };
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title with minimal spacing
    doc.setFontSize(16);
    doc.text("Office for Students Affair - Assets Inventory Report", 20, 15);
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${moment().format('MMMM D, YYYY, h:mm A')}`, 20, 25);
    
    // Add summary section right after generation date
    const summary = generateSummaryStats(assets);
    doc.setFontSize(12);
    doc.text('Summary:', 20, 35);
    doc.setFontSize(10);
    doc.text(`Total Assets: ${summary.totalAssets}`, 20, 42);
    doc.text(`Total Quantity: ${summary.totalQuantity}`, 20, 49);

    // Prepare table headers and data
    const tableColumn = [];
    const tableRows = [];

    // Add visible columns to headers
    if (visibleColumns.id) tableColumn.push("ID");
    if (visibleColumns.productCode) tableColumn.push("Product Code");
    if (visibleColumns.serialNumber) tableColumn.push("Serial Number");
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
      if (visibleColumns.serialNumber) rowData.push(asset.serialNumber);
      if (visibleColumns.dateCreated) rowData.push(moment(asset.createdDate).format("MM/DD/YYYY"));
      if (visibleColumns.asset) rowData.push(asset.assetName);
      if (visibleColumns.costPerUnit) {
        const cost = parseFloat(asset.cost).toFixed(2).toString().replace(/\s+/g, '');
        rowData.push(`PHP${cost}`);
      }
      if (visibleColumns.quantity) rowData.push(asset.quantity);
      if (visibleColumns.totalCost) {
        const total = (parseFloat(asset.cost) * asset.quantity).toFixed(2).toString().replace(/\s+/g, '');
        rowData.push(`PHP ${total}`);
      }
      if (visibleColumns.borrow) rowData.push(asset.is_active ? "Active" : "Inactive");
      if (visibleColumns.quantityForBorrowing) rowData.push(asset.is_active ? asset.quantity_for_borrowing : "N/A");
      if (visibleColumns.lastUpdated) rowData.push(asset.lastUpdated ? moment(asset.lastUpdated).format("MM/DD/YYYY") : "N/A");
      
      tableRows.push(rowData);
    });

    // Generate the table with adjusted starting position
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      styles: { 
        fontSize: 7,
        cellPadding: 1,
        font: 'helvetica',
        minCellWidth: 15,
        cellWidth: 'wrap',
        overflow: 'linebreak'
      },
      headStyles: { 
        fillColor: [0, 0, 0],
        textColor: [254, 192, 15],
        fontSize: 7,
        fontStyle: 'bold'
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 20, left: 15, right: 15, bottom: 40 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 'auto' },
      }
    });

    // Get the final Y position after the table
    const finalY = doc.lastAutoTable.finalY || 70;

    // Add approval and signature lines with less spacing
    doc.setFontSize(10);
    doc.text('Prepared by:', 20, finalY + 20);
    doc.line(70, finalY + 20, 180, finalY + 20);

    doc.text('Noted by:', 20, finalY + 40);
    doc.line(70, finalY + 40, 180, finalY + 40);
    // Save the PDF
    doc.save("assets-inventory.pdf");
  };

  return (
    <div className="flex justify-end space-x-3">
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
        className="p-2 rounded-full bg-yellow-400 border-2 text-white hover:bg-yellow-300 duration-300 flex items-center justify-center"
        title="Export to PDF"
      >
        <FontAwesomeIcon icon={faFilePdf} className="text-lg" />
      </button>
    </div>
  );
};

export default TableControls; 