import React from 'react';
import moment from 'moment';

const ViewRequestModal = ({ isOpen, onClose, request }) => {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all animate-fadeIn font-roboto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black">Request Details</h2>
            <button
              onClick={onClose}
              className="text-black hover:text-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <img 
                src={request.user_picture || "/osa-img.png"} 
                alt={request.created_by} 
                className="w-12 h-12 rounded-full mr-3"
              />
              <div>
                <p className="font-semibold text-gray-800">{request.created_by}</p>
                <p className="text-sm text-gray-600">
                  Requested on {moment(request.created_at).format("MMMM DD, YYYY")}
                </p>
              </div>
            </div>

            {/* Request Details */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Asset Name</label>
                <p className="text-gray-800">{request.asset_name}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity</label>
                <p className="text-gray-800">{request.quantity}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Comments</label>
                <p className="text-gray-800 whitespace-pre-wrap">
                  {request.comments || 'No comments provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
            <button 
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRequestModal;
