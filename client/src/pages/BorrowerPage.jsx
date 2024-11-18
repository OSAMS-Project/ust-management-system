import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import BorrowSelectModal from '../components/borrower/BorrowSelectModal';
import TermsAndConditionsModal from '../components/borrower/TermsAndConditionsModal';
import supabase from '../config/supabaseClient';
import { toast } from 'react-hot-toast';

function BorrowerForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [purpose, setPurpose] = useState("");
  const [coverLetter, setCoverLetter] = useState(null);
  const [contactNo, setContactNo] = useState("");
  const [activeAssets, setActiveAssets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expectedReturnDate, setExpectedReturnDate] = useState(""); // New state for expected return date
  const [notes, setNotes] = useState(""); // New state for notes
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track submission status
  const [confirmationMessage, setConfirmationMessage] = useState(""); // State for confirmation message
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setConfirmationMessage("");

    // Validate selected assets
    if (!selectedAssets || selectedAssets.length === 0) {
      toast.error('Please select at least one asset');
      setIsSubmitting(false);
      return;
    }

    try {
      let coverLetterUrl = null;

      // Upload cover letter if exists
      if (coverLetter) {
        const timestamp = new Date().getTime();
        const cleanFileName = coverLetter.name.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `cover_letters/${timestamp}-${cleanFileName}`;

        // Upload to Supabase
        const { error: uploadError } = await supabase.storage
          .from('samplebucket')
          .upload(fileName, coverLetter);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data } = supabase.storage
          .from('samplebucket')
          .getPublicUrl(fileName);

        coverLetterUrl = data.publicUrl;
      }

      const requestBody = {
        name,
        email,
        department,
        purpose,
        contactNo,
        coverLetterUrl,
        selectedAssets,
        expectedReturnDate,
        dateToBeCollected: selectedAssets[0]?.dateToBeCollected || '',
        notes
      };

      console.log('Submitting request:', requestBody);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/borrowing-requests`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Response:', response.data);
      setConfirmationMessage("Your borrowing request has been submitted successfully!");
      toast.success('Request submitted successfully!');
      resetForm();
    } catch (error) {
      console.error('Error submitting borrowing request:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Error submitting request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail(""); // Reset email field
    setDepartment("");
    setPurpose("");
    setContactNo("");
    setCoverLetter(null);
    setSelectedAssets([]);
    setExpectedReturnDate("");
    setNotes("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setCoverLetter(file);
    } else {
      alert("Please upload a PDF file.");
      e.target.value = null;
    }
  };

  const fetchActiveAssets = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/assets/active`);
      setActiveAssets(response.data);
    } catch (error) {
      console.error('Error fetching active assets:', error);
    }
  };

  useEffect(() => {
    fetchActiveAssets();
  }, []);

  return (
    <>
      {!agreedToTerms && (
        <TermsAndConditionsModal 
          onAccept={() => {
            setAgreedToTerms(true);
            setShowTerms(false);
          }}
        />
      )}
      {agreedToTerms && (
        <div className="flex min-h-screen w-screen overflow-hidden">
          <div className="w-1/2 bg-cover bg-center hidden lg:block" style={{ backgroundImage: "url('./ust-image.JPG')" }}></div>
          <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 bg-white">
            <h1 className="text-3xl font-bold text-black mb-4 leading-snug">Asset Request Form</h1>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Borrow Materials from UST-OSA Asset Management System
            </p>
        
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=" "
                  className="block w-full px-3 py-2 border-b-2 border-gray-300 bg-transparent text-base text-black tracking-wide focus:border-black focus:outline-none transition-colors duration-300 peer"
                />
                <label
                  htmlFor="name"
                  className="absolute left-3 top-2 text-gray-500 duration-300 transform -translate-y-6 scale-75 origin-0 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Enter your name
                </label>
              </div>
        
              {/* Email Field */}
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=" "
                  className="block w-full px-3 py-2 border-b-2 border-gray-300 bg-transparent text-base text-black tracking-wide focus:border-black focus:outline-none transition-colors duration-300 peer"
                />
                <label
                  htmlFor="email"
                  className="absolute left-3 top-2 text-gray-500 duration-300 transform -translate-y-6 scale-75 origin-0 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Enter your email
                </label>
              </div>
        
              {/* Department Field */}
              <div className="relative">
                <input
                  type="text"
                  id="department"
                  name="department"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder=" "
                  className="block w-full px-3 py-2 border-b-2 border-gray-300 bg-transparent text-base text-black tracking-wide focus:border-black focus:outline-none transition-colors duration-300 peer"
                />
                <label
                  htmlFor="department"
                  className="absolute left-3 top-2 text-gray-500 duration-300 transform -translate-y-6 scale-75 origin-0 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Enter your department
                </label>
              </div>
        
              {/* Selected Assets Display and Select Asset Button */}
              <div className="relative flex flex-col">
                <h2 className="text-base font-semibold text-black mb-2">Selected Assets:</h2>
                {selectedAssets.length > 0 ? (
                  <ul className="list-disc pl-4 mb-2 text-gray-600 tracking-wide text-sm">
                    {selectedAssets.map((asset, index) => (
                      <li key={index}>{asset.assetName} (Quantity: {asset.quantity})</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 mb-2 text-sm">No assets selected.</p>
                )}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-3 rounded text-sm tracking-wide"
                >
                  Select Asset
                </button>
              </div>
        
              {/* Purpose Field */}
              <div className="relative">
                <input
                  type="text"
                  id="purpose"
                  name="purpose"
                  required
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder=" "
                  className="block w-full px-3 py-2 border-b-2 border-gray-300 bg-transparent text-base text-black tracking-wide focus:border-black focus:outline-none transition-colors duration-300 peer"
                />
                <label
                  htmlFor="purpose"
                  className="absolute left-3 top-2 text-gray-500 duration-300 transform -translate-y-6 scale-75 origin-0 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Enter the purpose of borrowing
                </label>
              </div>
        
              {/* Contact Number Field */}
              <div className="relative">
                <input
                  type="tel"
                  id="contactNo"
                  name="contactNo"
                  required
                  value={contactNo}
                  onChange={(e) => setContactNo(e.target.value)}
                  placeholder=" "
                  className="block w-full px-3 py-2 border-b-2 border-gray-300 bg-transparent text-base text-black tracking-wide focus:border-black focus:outline-none transition-colors duration-300 peer"
                />
                <label
                  htmlFor="contactNo"
                  className="absolute left-3 top-2 text-gray-500 duration-300 transform -translate-y-6 scale-75 origin-0 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Enter your contact number
                </label>
              </div>
        
              {/* Expected Date of Return Field */}
              <div className="relative">
                <input
                  type="date"
                  id="expectedReturnDate"
                  name="expectedReturnDate"
                  required
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  className="block w-full px-3 py-2 border-b-2 border-gray-300 bg-transparent text-base text-black tracking-wide focus:border-black focus:outline-none transition-colors duration-300"
                />
                <label
                  htmlFor="expectedReturnDate"
                  className="absolute left-3 top-2 text-gray-500 duration-300 transform -translate-y-6 scale-75 origin-0 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Expected Date of Return
                </label>
              </div>
        
              {/* Notes Field */}
              <div className="relative">
                <textarea
                  id="notes"
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder=" "
                  className="block w-full px-3 py-2 border-b-2 border-gray-300 bg-transparent text-base text-black tracking-wide focus:border-black focus:outline-none transition-colors duration-300 peer"
                />
                <label
                  htmlFor="notes"
                  className="absolute left-3 top-2 text-gray-500 duration-300 transform -translate-y-6 scale-75 origin-0 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Additional Notes
                </label>
              </div>
        
              {/* Cover Letter Upload Field */}
              <div className="relative">
                <label
                  htmlFor="coverLetter"
                  className="block mb-1 text-sm font-medium text-gray-600"
                >
                  Upload Cover Letter (PDF only)
                </label>
                <input
                  type="file"
                  id="coverLetter"
                  name="coverLetter"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-3 file:py-2 file:px-3
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-gray-200 file:text-gray-700
                    hover:file:bg-gray-300 transition-colors duration-300"
                />
                {coverLetter && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected file: {coverLetter.name}
                  </div>
                )}
              </div>
        
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full ${isSubmitting ? 'bg-gray-400' : 'bg-black'} text-white text-lg font-medium py-2 rounded-md hover:bg-gray-900 transition-colors duration-300 transform hover:scale-105 tracking-wider`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
        
            {/* Confirmation Message */}
            {confirmationMessage && (
              <div className="mt-3 text-green-500">
                {confirmationMessage}
              </div>
            )}
        
            {/* Back to Login */}
            <Link to="/" className="mt-5 text-gray-600 hover:text-gray-500 transition-colors duration-300">
              ← Back to Login
            </Link>
        
            {/* Modal */}
            <BorrowSelectModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              activeAssets={activeAssets}
              onSelectMaterials={(selectedAssets) => {
                setSelectedAssets(selectedAssets);
                setIsModalOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default BorrowerForm;