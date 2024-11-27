import { useState } from "react";
import { Link } from "react-router-dom";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function EmailRequestForm() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [requestStatus, setRequestStatus] = useState(""); // State for request status

  const saveUserToDatabase = async (userData) => {
    try {
      console.log("Sending user data:", userData);
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users`,
        {
          name: userData.name,
          email: userData.email,
          picture: userData.picture,
          hd: userData.hd,
          access: false,
          role_name: "user", // Set role_name dynamically if needed
          color: "#FFFFFF", // Set color dynamically if needed
        }
      );

      if (response.status === 201) {
        console.log("User saved successfully");
        setIsLoggedIn(true);
        setRequestStatus(
          "Your request has been sent. Please wait for approval."
        ); // Update request status
      } else {
        console.error("Failed to save user:", response.data.message);
        setRequestStatus("Please wait for your approval, pending."); // Update request status if there's an issue
      }
    } catch (error) {
      console.error("Error saving user to the database:", error);
      setRequestStatus("There was an error processing your request."); // Handle error scenario
    }
  };

  const handleLoginSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("Credential Response Decoded:", decoded);
      setUserInfo(decoded);
      saveUserToDatabase(decoded);
    } catch (error) {
      console.error("Error decoding JWT:", error);
    }
  };

  const handleLoginFailure = (error) => {
    console.error("Error logging in:", error);
    setIsLoggedIn(false);
  };

  return (
    <div className="relative flex h-screen w-screen overflow-hidden lg:overflow-auto">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: "url('./ust-img-4.JPG')" }}
        ></div>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>

      {/* Left Section - Logo */}
      <div className="relative w-1/2 flex justify-center items-center hidden lg:flex">
        <img
          src="/logo.png"
          alt="UST logo"
          className="w-2/3 h-auto object-contain"
        />
      </div>

      {/* Right Section - Login Form */}
      <div className="relative w-full lg:w-1/2 flex flex-col justify-start lg:justify-center p-6 lg:p-16 bg-white bg-opacity-90 overflow-y-auto">
        {/* Logo */}
        <img
          src="/ust-logo.png"
          alt="UST Logo"
          className="mb-4 w-20 h-20 lg:w-24 lg:h-24"
        />

        {/* Title */}
        <h1 className="text-4xl lg:text-5xl font-extrabold text-black mb-6 leading-tight">
          Request Access
        </h1>

        {/* Description */}
        <p className="text-lg lg:text-xl text-gray-600 mb-4 leading-relaxed">
          To access the UST-OSA Asset Management System, please sign in with
          your Google account. Your request will be sent to the administrator
          for approval.
        </p>

        {/* Google Login Button */}
        <GoogleOAuthProvider clientId={clientId}>
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={handleLoginFailure}
            hd={"ust.edu.ph"}
          />
        </GoogleOAuthProvider>

        {/* Request Status/Error Message */}
        {requestStatus && (
          <div className="flex text-red-500 mb-4 mt-4">
            <FontAwesomeIcon icon={faExclamationCircle} className="mr-2 mt-1" />
            <span>{requestStatus}</span>
          </div>
        )}

        {/* Divider Line */}
        <hr className="border-gray-300 mb-4 mt-4" />

        {/* Back to Login Link */}
        <Link
          to="/"
          className="text-gray-600 hover:text-gray-500 transition-colors duration-300 flex items-center"
        >
          <FontAwesomeIcon icon={faHome} className="mr-2" />
          Return to Login
        </Link>
      </div>
    </div>
  );
}

export default EmailRequestForm;
