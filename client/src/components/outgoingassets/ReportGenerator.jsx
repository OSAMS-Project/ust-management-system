import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const ReportGenerator = ({ outgoingAssets, onClose, dateRange, selectedCategory }) => {
  const [reportType, setReportType] = useState('daily');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      
      // Get filtered data based on report type
      const filteredData = filterDataByReportType(outgoingAssets, reportType);
      const summary = generateSummaryStats(filteredData);

      // Add title with minimal spacing
      doc.setFontSize(20);
      doc.text('Office for Student Affairs - Asset Consumption Report', 20, 15);

      // Add report generation date with minimal spacing
      doc.setFontSize(10);
      doc.text(`Generated on: ${moment().format('MMMM D, YYYY, h:mm A')}`, 20, 25);

      // Add report period with minimal spacing
      doc.setFontSize(12);
      doc.text(`Report Period: ${getReportPeriod(reportType)}`, 20, 35);

      // Add summary with minimal spacing
      doc.setFontSize(14);
      doc.text('Summary:', 20, 45);
      doc.setFontSize(12);
      doc.text(`Total Assets Consumed: ${summary.totalAssets}`, 20, 55);
      doc.text(`Total Quantity Consumed: ${summary.totalQuantity}`, 20, 65);

      // Add detailed list using auto-table with adjusted starting position
      doc.autoTable({
        startY: 75,
        head: [['Date', 'Asset Name', 'Quantity', 'Reason']],
        body: filteredData.map(asset => [
          moment(asset.consumed_date).format('MM/DD/YYYY'),
          asset.assetName,
          asset.quantity,
          asset.reason
        ]),
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0], textColor: [254, 192, 15] },
        styles: { fontSize: 10 }
      });

      // Get the final Y position after the table
      const finalY = doc.lastAutoTable.finalY || 150;

      // Keep the approval and signature lines
      doc.setFontSize(12);
      doc.text('Prepared by:', 20, finalY + 40);
      doc.text('Noted by:', 20, finalY + 60);

      // Keep the underlines
      doc.setLineWidth(0.5);
      doc.line(70, finalY + 40, 180, finalY + 40);
      doc.line(70, finalY + 60, 180, finalY + 60);

      // Save the PDF
      doc.save(`asset-consumption-report-${reportType}-${moment().format('YYYY-MM-DD')}.pdf`);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const filterDataByReportType = (data, type) => {
    const now = moment();
    switch (type) {
      case 'daily':
        return data.filter(asset => 
          moment(asset.consumed_date).isSame(now, 'day')
        );
      case 'weekly':
        return data.filter(asset => 
          moment(asset.consumed_date).isSame(now, 'week')
        );
      case 'monthly':
        return data.filter(asset => 
          moment(asset.consumed_date).isSame(now, 'month')
        );
      case 'yearly':
        return data.filter(asset => 
          moment(asset.consumed_date).isSame(now, 'year')
        );
      default:
        return data;
    }
  };

  const getReportPeriod = (type) => {
    const now = moment();
    switch (type) {
      case 'daily':
        return now.format('MMMM D, YYYY');
      case 'weekly':
        return `Week of ${now.startOf('week').format('MMMM D')} - ${now.endOf('week').format('MMMM D, YYYY')}`;
      case 'monthly':
        return now.format('MMMM YYYY');
      case 'yearly':
        return now.format('YYYY');
      default:
        return 'Custom Period';
    }
  };

  const generateSummaryStats = (data) => {
    return {
      totalAssets: data.length,
      totalQuantity: data.reduce((sum, asset) => sum + (asset.quantity || 0), 0),
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Generate Report</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="daily">Daily Report</option>
            <option value="weekly">Weekly Report</option>
            <option value="monthly">Monthly Report</option>
            <option value="yearly">Yearly Report</option>
          </select>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={generateReport}
            disabled={isGenerating}
            className="bg-black text-[#FEC00F] px-4 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                Generating...
              </>
            ) : (
              'Generate PDF'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;