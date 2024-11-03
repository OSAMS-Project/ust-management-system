import React from 'react';

const NotificationPopup = ({ notification, onClose }) => {
  if (!notification) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div role="alert" className="rounded-xl border border-gray-100 bg-white p-4 shadow-lg max-w-sm">
        <div className="flex items-start gap-4">
          <span className={notification.type === 'success' ? 'text-green-600' : 'text-red-600'}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={notification.type === 'success' 
                  ? "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  : "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"}
              />
            </svg>
          </span>

          <div className="flex-1">
            <strong className="block font-medium text-gray-900">
              {notification.type === 'success' ? 'Success' : 'Error'}
            </strong>
            <p className="mt-1 text-sm text-gray-700">{notification.message}</p>
          </div>

          <button className="text-gray-500 transition hover:text-gray-600" onClick={onClose}>
            <span className="sr-only">Dismiss popup</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;

