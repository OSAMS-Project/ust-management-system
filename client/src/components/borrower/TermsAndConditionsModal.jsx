import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TermsAndConditionsModal = ({ onAccept }) => {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (agreed) {
      onAccept();
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Terms and Conditions</h2>
          
          <div className="h-[300px] overflow-y-auto border rounded-md p-4 mb-6">
            <div className="text-sm space-y-4">
              <section>
                <h3 className="text-lg font-semibold mb-2">1. Borrowing Guidelines</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>All borrowed items must be returned in the same condition as they were borrowed.</li>
                  <li>Borrowers are responsible for any damage or loss of borrowed items.</li>
                  <li>Items must be returned by the specified return date.</li>
                  <li>Late returns may result in penalties or restrictions on future borrowing privileges.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">2. Documentation Requirements</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>The cover letter must clearly state the purpose and intended use of the borrowed items.</li>
                  <li>All contact information provided must be accurate and current.</li>
                  <li>Supporting documents may be required depending on the items being borrowed.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">3. Usage Policy</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Borrowed items are for official university-related activities only.</li>
                  <li>The Office of Student Affairs reserves the right to deny borrowing requests.</li>
                  <li>Transfer of borrowed items to unauthorized persons is strictly prohibited.</li>
                </ul>
              </section>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium text-gray-700"
              >
                I have read and agree to the terms and conditions
              </label>
            </div>

            <div className="flex justify-between gap-4">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!agreed}
                className={`flex-1 px-4 py-2 rounded-md text-white transition-colors duration-200 
                  ${agreed ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                Accept & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsModal;
