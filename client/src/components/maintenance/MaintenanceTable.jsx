import React from 'react';

const MaintenanceTable = ({ maintenanceRecords, onCompleteRecord, onRemoveRecord }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Asset</th>
            <th className="px-4 py-2 text-left">Maintenance Type</th>
            <th className="px-4 py-2 text-left">Description</th>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Cost</th>
            <th className="px-4 py-2 text-left">Performed By</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {maintenanceRecords.map((record) => (
            <tr key={record.id} className="border-b">
              <td className="px-4 py-2">{record.asset_id}</td>
              <td className="px-4 py-2">{record.maintenance_type}</td>
              <td className="px-4 py-2">{record.description}</td>
              <td className="px-4 py-2">{new Date(record.date).toLocaleDateString()}</td>
              <td className="px-4 py-2">₱{typeof record.cost === 'number' ? record.cost.toFixed(2) : record.cost}</td>
              <td className="px-4 py-2">{record.performed_by}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => onCompleteRecord(record.id)}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded mr-2"
                >
                  Complete
                </button>
                <button
                  onClick={() => onRemoveRecord(record.id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MaintenanceTable;
