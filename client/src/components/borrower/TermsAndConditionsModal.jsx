import React, { useState } from 'react';

function TermsAndConditionsModal({ onAccept, termsContent }) {
  const [isChecked, setIsChecked] = useState(false);
  
  if (!termsContent) return null;

  return (
    <div
          className="relative flex items-center justify-center min-h-screen w-full bg-cover bg-center"
          style={{ backgroundImage: "url('./ust-img-8.jpg')" }}
        >
          {/* Overlay for better contrast */}
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative border border-gray-200 w-[600px] shadow-lg rounded-lg bg-white">
        <div className="p-6">
          <h3 className="text-[22px] font-bold text-gray-800 mb-4">Terms and Conditions</h3>
          
          <div className="mt-2 max-h-[300px] overflow-y-auto border border-gray-200 rounded-md">
            <div className="p-4">
              {/* Borrowing Guidelines */}
              <div className="mb-4">
                <h4 className="text-[16px] font-bold text-gray-800 mb-2">1. Borrowing Guidelines</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {termsContent.borrowingGuidelines?.map((guideline, index) => (
                    <li key={index} className="text-[14px] text-gray-700">{guideline}</li>
                  ))}
                </ul>
              </div>

              {/* Documentation Requirements */}
              <div className="mb-4">
                <h4 className="text-[16px] font-bold text-gray-800 mb-2">2. Documentation Requirements</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {termsContent.documentationRequirements?.map((requirement, index) => (
                    <li key={index} className="text-[14px] text-gray-700">{requirement}</li>
                  ))}
                </ul>
              </div>

              {/* Usage Policy */}
              <div className="mb-4">
                <h4 className="text-[16px] font-bold text-gray-800 mb-2">3. Usage Policy</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {termsContent.usagePolicy?.map((policy, index) => (
                    <li key={index} className="text-[14px] text-gray-700">{policy}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Checkbox */}
          <div className="mt-4 mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="h-4 w-4 border-gray-300 rounded"
              />
              <span className="ml-2 text-[13px] text-gray-600">
                I have read and agree to the terms and conditions
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-md text-[14px] text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={onAccept}
              disabled={!isChecked}
              className={`flex-1 px-4 py-2 rounded-md text-[14px] text-white
                ${isChecked 
                  ? 'bg-yellow-500 hover:bg-yellow-600' 
                  : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default TermsAndConditionsModal;
