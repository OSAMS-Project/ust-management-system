import React from 'react';
import moment from 'moment';

const ViewRequestModal = ({ isOpen, onClose, request }) => {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Request Details</h2>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <img 
              src={request.user_picture || "https://via.placeholder.com/40"} 
              alt={request.created_by} 
              className="w-12 h-12 rounded-full mr-3"
            />
            <div>
              <p className="font-semibold">{request.created_by}</p>
              <p className="text-sm text-gray-500">
                Requested on {moment(request.created_at).format("MM/DD/YYYY")}
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="mb-3">
              <label className="font-semibold block">Asset Name:</label>
              <p>{request.asset_name}</p>
            </div>
            <div className="mb-3">
              <label className="font-semibold block">Quantity:</label>
              <p>{request.quantity}</p>
            </div>
            <div className="mb-3">
              <label className="font-semibold block">Comments:</label>
              <p className="text-gray-700">{request.comments || 'No comments provided'}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewRequestModal;
