import React, { useEffect, useState } from 'react';

const NotificationPopup = ({ notification, onClose }) => {
  const [progress, setProgress] = useState(100);
  const DURATION = 3000; // 3 seconds

  useEffect(() => {
    if (notification) {
      // Reset progress when new notification appears
      setProgress(100);

      // Start progress bar animation
      const startTime = Date.now();
      const timer = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const newProgress = 100 - (elapsedTime / DURATION) * 100;
        
        if (newProgress <= 0) {
          clearInterval(timer);
          onClose();
        } else {
          setProgress(newProgress);
        }
      }, 10);

      // Auto close after duration
      const timeout = setTimeout(() => {
        onClose();
      }, DURATION);

      // Cleanup
      return () => {
        clearInterval(timer);
        clearTimeout(timeout);
      };
    }
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div className="fixed top-4 right-4 min-w-[300px] rounded-lg shadow-lg overflow-hidden">
      <div className={`p-4 ${
        notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
      } text-white`}>
        <div className="flex items-center justify-between">
          <span className="font-medium">{notification.message}</span>
          <button 
            onClick={onClose}
            className="ml-4 text-white hover:text-gray-200 focus:outline-none"
          >
            ×
          </button>
        </div>
      </div>
      {/* Progress bar */}
      <div 
        className={`h-1 ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } transition-all duration-100 ease-linear`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default NotificationPopup;

