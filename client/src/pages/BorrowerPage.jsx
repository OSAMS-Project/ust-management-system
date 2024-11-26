import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import BorrowSelectModal from "../components/borrower/BorrowSelectModal";
import TermsAndConditionsModal from "../components/borrower/TermsAndConditionsModal";
import supabase from "../config/supabaseClient";
import { toast } from "react-hot-toast";
import ReCAPTCHA from "react-google-recaptcha";
import moment from "moment"; // Import moment library

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
  const [expectedReturnDate, setExpectedReturnDate] = useState(() => {
    const date = new Date();
    date.setHours(8, 0, 0, 0); // Set default time to 8:00 AM
    return date.toISOString();
  });
  const [notes, setNotes] = useState(""); // New state for notes
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track submission status
  const [confirmationMessage, setConfirmationMessage] = useState(""); // State for confirmation message
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(true);
  const [recaptchaToken, setRecaptchaToken] = useState(null); // State for reCAPTCHA token
  const [isVerified, setIsVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [verificationCodeSent, setVerificationCodeSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState(null);
  const [contactNoError, setContactNoError] = useState(""); // Add this new state
  const [requests, setRequests] = useState([]);
  const [emailNotificationSent, setEmailNotificationSent] = useState(false); // Use state for tracking

  let lastNotifiedCount = 0; // Tracks the last count when a notification was sent

  const fetchRequests = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/borrowing-requests`
      );

      if (!Array.isArray(response.data)) {
        console.error("Invalid response format:", response.data);
        return;
      }

      setRequests(response.data);
      checkAndNotifyAdmin(response.data); // Pass fetched requests to the check function
    } catch (error) {
      console.error("Error fetching borrowing requests:", error);
      toast.error("Failed to load borrowing requests.");
    }
  };

  // Check pending requests and notify admin
  let notifyTimeout; // Add a global variable to track the timeout

  const checkAndNotifyAdmin = async (requestsList) => {
    clearTimeout(notifyTimeout); // Clear previous timeout

    notifyTimeout = setTimeout(async () => {
      const pendingCount = requestsList.filter(
        (req) => req.status === "Pending"
      ).length;

      // Notify when count is 10 or more and at every 5-pending increment
      if (
        pendingCount >= 10 &&
        (pendingCount - lastNotifiedCount >= 5 || lastNotifiedCount === 0)
      ) {
        try {
          const adminResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/notification-settings`
          );
          const adminEmail = adminResponse.data.notification_email;

          if (!adminEmail) {
            console.warn("No admin email configured for notifications.");
            return;
          }

          await axios.post(
            `${process.env.REACT_APP_API_URL}/api/notification-settings/pending-alert`,
            {
              email: adminEmail,
              pendingCount,
            }
          );

          lastNotifiedCount = pendingCount; // Update the last notified count
          toast.success(
            `Admin notified about ${pendingCount} pending requests.`
          );
        } catch (error) {
          console.error("Failed to notify admin:", error);
          toast.error("Error notifying admin about pending requests.");
        }
      } else if (pendingCount < 10) {
        lastNotifiedCount = 0; // Reset notification tracking when below 10
      }
    }, 300); // Debounce duration in milliseconds
  };

  useEffect(() => {
    const fetchInitialRequests = async () => {
      await fetchRequests();
    };

    fetchInitialRequests();
  }, []); // Empty dependency array ensures this runs only once on component mount

  const handleContactNumberChange = (e) => {
    const value = e.target.value;
    const numbersOnly = value.replace(/[^0-9]/g, "");

    // Validate PH number format
    if (numbersOnly.length > 0) {
      if (!numbersOnly.startsWith("09")) {
        setContactNoError("Phone number must start with 09");
      } else if (numbersOnly.length !== 11) {
        setContactNoError("Phone number must be 11 digits");
      } else {
        setContactNoError("");
      }
    } else {
      setContactNoError("");
    }

    setContactNo(numbersOnly);
  };

  const handleReCAPTCHAChange = (token) => {
    setRecaptchaToken(token); // Store reCAPTCHA token
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setConfirmationMessage("");

    // Add phone number validation before submission
    if (!contactNo.startsWith("09") || contactNo.length !== 11) {
      toast.error("Please enter a valid Philippine mobile number");
      setIsSubmitting(false);
      return;
    }

    if (!recaptchaToken) {
      toast.error("Please complete the reCAPTCHA.");
      setIsSubmitting(false);
      return;
    }

    if (!isVerified) {
      toast.error("Please verify your email before submitting");
      setIsSubmitting(false);
      return;
    }

    // Validate selected assets
    if (!selectedAssets || selectedAssets.length === 0) {
      toast.error("Please select at least one asset");
      setIsSubmitting(false);
      return;
    }

    try {
      let coverLetterUrl = null;

      // Upload cover letter if exists
      if (coverLetter) {
        const timestamp = new Date().getTime();
        const cleanFileName = coverLetter.name.replace(/[^a-zA-Z0-9]/g, "_");
        const fileName = `cover_letters/${timestamp}-${cleanFileName}`;

        // Upload to Supabase with error handling
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("samplebucket")
          .upload(fileName, coverLetter, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Supabase upload error:", uploadError);
          toast.error("Failed to upload cover letter");
          setIsSubmitting(false);
          return;
        }

        // Get public URL after successful upload
        const { data: urlData } = await supabase.storage
          .from("samplebucket")
          .getPublicUrl(fileName);

        if (!urlData?.publicUrl) {
          throw new Error("Failed to get public URL for uploaded file");
        }

        coverLetterUrl = urlData.publicUrl;
      }

      const requestBody = {
        name,
        email,
        department,
        purpose,
        contactNo,
        coverLetterUrl,
        selectedAssets,
        expectedReturnDate: moment(expectedReturnDate).format(
          "YYYY-MM-DDTHH:mm:ss"
        ), // Update to match date to be collected format
        dateToBeCollected: selectedAssets[0]?.dateToBeCollected || "",
        notes,
        recaptchaToken,
      };

      console.log("Submitting request:", requestBody);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/borrowing-requests`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response:", response.data);
      setConfirmationMessage(
        "Your borrowing request has been submitted successfully!"
      );
      toast.success("Request submitted successfully!");
      resetForm();
    } catch (error) {
      console.error("Error submitting borrowing request:", error);
      toast.error(error.response?.data?.message || "Error submitting request");
      setIsSubmitting(false);
      setRecaptchaToken(null);
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
    setExpectedReturnDate(new Date().toISOString()); // Reset to 8:00 AM
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
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/assets/active`
      );
      setActiveAssets(response.data);
    } catch (error) {
      console.error("Error fetching active assets:", error);
    }
  };

  const sendVerificationCode = async () => {
    if (!email.trim()) {
      setEmailError("Email is required to send a verification code.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/borrowing-requests/send-verification-code`,
        { email }
      );
      toast.success("Verification code sent to your email");
      setVerificationCodeSent(true);
      setEmailError(""); // Clear error on success
    } catch (error) {
      console.error("Error sending verification code:", error.response?.data);
      toast.error("Failed to send verification code");
      setEmailError("Error sending verification code. Please try again.");
    }
  };

  const verifyCode = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/borrowing-requests/verify-code`,
        {
          email,
          code: verificationCode,
        }
      );
      toast.success(response.data.message);
      setIsVerified(true);
      setVerificationError(""); // Clear error if successful
    } catch (error) {
      setVerificationError(
        error.response?.data?.message || "Invalid or expired verification code"
      );
    }
  };

  const handleExpectedReturnDateChange = (e) => {
    const selectedDateTime = new Date(e.target.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison

    // Check if the selected day is Saturday (6) or Sunday (0)
    const dayOfWeek = selectedDateTime.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      toast.error("Please select a weekday (Monday to Friday)");
      // Keep the current date
      return;
    }

    // Extract hours and minutes for office hours validation
    const hours = selectedDateTime.getHours();
    const minutes = selectedDateTime.getMinutes();
    const timeInMinutes = hours * 60 + minutes;
    const startOfDay = 8 * 60; // 8:00 AM in minutes
    const endOfDay = 17 * 60; // 5:00 PM in minutes

    // Compare dates without time for past date validation
    const selectedDate = new Date(selectedDateTime);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      toast.error("Expected return date cannot be in the past");
      return;
    }

    if (timeInMinutes < startOfDay || timeInMinutes > endOfDay) {
      toast.error("Please select a time between 8:00 AM and 5:00 PM");
      return;
    }

    // If all validations pass, use the selected date and time
    setExpectedReturnDate(e.target.value);
  };

  useEffect(() => {
    fetchActiveAssets();
  }, []);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/terms-and-conditions`
        );
        if (response.data && response.data.borrowing_guidelines) {
          setTermsAndConditions({
            borrowingGuidelines: response.data.borrowing_guidelines || [],
            documentationRequirements:
              response.data.documentation_requirements || [],
            usagePolicy: response.data.usage_policy || [],
          });
        } else {
          // Set default empty values if data is missing
          setTermsAndConditions({
            borrowingGuidelines: [],
            documentationRequirements: [],
            usagePolicy: [],
          });
          console.warn("Terms and conditions data is incomplete or missing");
        }
      } catch (error) {
        console.error("Error fetching terms:", error);
        toast.error("Failed to load terms and conditions");
        // Set default empty values on error
        setTermsAndConditions({
          borrowingGuidelines: [],
          documentationRequirements: [],
          usagePolicy: [],
        });
      }
    };

    fetchTerms();
  }, []);

  return (
    <>
      {!agreedToTerms && termsAndConditions && (
        <TermsAndConditionsModal
          onAccept={() => {
            setAgreedToTerms(true);
            setShowTerms(false);
          }}
          termsContent={termsAndConditions}
        />
      )}
      {agreedToTerms && (
        <div className="flex min-h-screen w-screen overflow-hidden">
          <div
            className="w-1/2 bg-cover bg-center hidden lg:block"
            style={{ backgroundImage: "url('./ust-image.JPG')" }}
          ></div>
          <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 bg-white">
            <h1 className="text-3xl font-bold text-black mb-4 leading-snug">
              Asset Request Form
            </h1>
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (e.target.value.trim()) {
                      setEmailError(""); // Clear error on valid input
                    }
                  }}
                  placeholder=" "
                  className={`block w-full px-3 py-2 border-b-2 ${
                    emailError ? "border-red-500" : "border-gray-300"
                  } bg-transparent text-base text-black tracking-wide focus:border-black focus:outline-none transition-colors duration-300 peer`}
                />
                <label
                  htmlFor="email"
                  className="absolute left-3 top-2 text-gray-500 duration-300 transform -translate-y-6 scale-75 origin-0 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Enter your email
                </label>
                {emailError && (
                  <span className="text-red-500 text-sm mt-1">
                    {emailError}
                  </span>
                )}
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
                <h2 className="text-base font-semibold text-black mb-2">
                  Selected Assets:
                </h2>
                {selectedAssets.length > 0 ? (
                  <ul className="list-disc pl-4 mb-2 text-gray-600 tracking-wide text-sm">
                    {selectedAssets.map((asset, index) => (
                      <li key={index}>
                        {asset.assetName} (Quantity: {asset.quantity})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 mb-2 text-sm">
                    No assets selected.
                  </p>
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
                  onChange={handleContactNumberChange}
                  maxLength="11"
                  pattern="09[0-9]{9}"
                  inputMode="numeric"
                  placeholder=" "
                  className={`block w-full px-3 py-2 border-b-2 ${
                    contactNoError ? "border-red-500" : "border-gray-300"
                  } bg-transparent text-base text-black tracking-wide focus:border-black focus:outline-none transition-colors duration-300 peer`}
                />
                <label
                  htmlFor="contactNo"
                  className="absolute left-3 top-2 text-gray-500 duration-300 transform -translate-y-6 scale-75 origin-0 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Enter your contact number (e.g., 09123456789)
                </label>
                {contactNoError && (
                  <p className="text-red-500 text-sm mt-1">{contactNoError}</p>
                )}
              </div>

              {/* Expected Date of Return Field */}
              <div className="relative">
                <input
                  type="datetime-local"
                  id="expectedReturnDate"
                  name="expectedReturnDate"
                  required
                  value={expectedReturnDate}
                  onChange={handleExpectedReturnDateChange}
                  min={(() => {
                    const now = new Date();
                    now.setHours(8, 0, 0, 0);
                    return now.toISOString();
                  })()}
                  step="60"
                  className="block w-full px-3 py-2 border-b-2 border-gray-300 bg-transparent text-base text-black tracking-wide focus:border-black focus:outline-none transition-colors duration-300"
                />
                <label
                  htmlFor="expectedReturnDate"
                  className="absolute left-3 top-2 text-gray-500 duration-300 transform -translate-y-6 scale-75 origin-0 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  Expected Date and Time of Return (8:00 AM - 5:00 PM)
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

              <ReCAPTCHA
                sitekey="6LfFloUqAAAAANFY-Z9-_0ll6ISjSk9TmqFU3rmI"
                onChange={handleReCAPTCHAChange}
              />

              {!isVerified && (
                <div className="space-y-4">
                  {/* Send Verification Code */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={sendVerificationCode}
                      className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-all ${
                        isSubmitting && "opacity-50 pointer-events-none"
                      }`}
                    >
                      {verificationCodeSent
                        ? "Resend Code"
                        : "Send Verification Code"}
                    </button>
                    <span className="text-gray-500 text-sm">
                      Check your email for the code
                    </span>
                  </div>

                  {/* Enter and Verify Code */}
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Enter verification code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                    {verificationError && (
                      <span className="text-red-500 text-sm">
                        {verificationError}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={verifyCode}
                      className={`bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-all ${
                        isSubmitting && "opacity-50 pointer-events-none"
                      }`}
                    >
                      Verify Code
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !isVerified || !recaptchaToken}
                className={`w-full ${
                  isSubmitting ? "bg-gray-400" : "bg-black"
                } text-white text-lg font-medium py-2 rounded-md hover:bg-gray-900 transition-colors duration-300 transform hover:scale-105 tracking-wider`}
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>

            {/* Confirmation Message */}
            {confirmationMessage && (
              <div className="mt-3 text-green-500">{confirmationMessage}</div>
            )}

            {/* Back to Login */}
            <Link
              to="/"
              className="mt-5 text-gray-600 hover:text-gray-500 transition-colors duration-300"
            >
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
