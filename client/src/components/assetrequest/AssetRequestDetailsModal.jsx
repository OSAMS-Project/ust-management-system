import React from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';

const AssetRequestDetailsModal = ({ isOpen, onClose, request }) => {
  if (!isOpen || !request) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto transform transition-all animate-fadeIn font-roboto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-black">Asset Request Details</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Request Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <p className="font-medium text-gray-700">Request ID:</p>
                <p className="text-gray-600">{request.id}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Asset Name:</p>
                <p className="text-gray-600">{request.asset_name}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Quantity:</p>
                <p className="text-gray-600">{request.quantity}</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <p className="font-medium text-gray-700">Status:</p>
                <p className={`font-medium ${
                  request.status === 'approved' ? 'text-green-600' :
                  request.status === 'declined' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                  {request.auto_declined && " (Auto-declined)"}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Requested By:</p>
                <div className="flex items-center gap-2">
                  <img
                    src={request.user_picture || "/osa-img.png"}
                    alt={request.created_by}
                    className="w-8 h-8 rounded-full"
                  />
                  <p className="text-gray-600">{request.created_by}</p>
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-700">Date Requested:</p>
                <p className="text-gray-600">
                  {moment(request.created_at).format('MMMM DD, YYYY hh:mm A')}
                </p>
              </div>
            </div>

            {/* Comments Section - Full width */}
            <div className="col-span-1 lg:col-span-2 bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-700 mb-2">Comments:</p>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-gray-600 whitespace-pre-wrap break-words">
                  {request.comments || 'No comments provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4">Request Timeline</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Created</p>
                    <p className="text-sm text-gray-600">
                      {moment(request.created_at).format('MMMM DD, YYYY hh:mm A')}
                    </p>
                  </div>
                </div>
                
                {request.approved_at && (
                  <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-green-600">Approved</p>
                      <p className="text-sm text-gray-600">
                        {moment(request.approved_at).format('MMMM DD, YYYY hh:mm A')}
                      </p>
                    </div>
                  </div>
                )}

                {request.declined_at && (
                  <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-red-600">
                        Declined {request.auto_declined && "(Automatically)"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {moment(request.declined_at).format('MMMM DD, YYYY hh:mm A')}
                      </p>
                    </div>
                  </div>
                )}
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
    </div>,
    document.body
  );
};

export default AssetRequestDetailsModal; 