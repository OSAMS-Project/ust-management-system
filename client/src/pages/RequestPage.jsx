import { useState } from "react";
import { Link } from "react-router-dom";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

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
    <div className="relative flex h-screen w-screen overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('./ust-image.JPG')" }}
      ></div>

      {/* Google Login Form Section */}
      <div className="relative w-full lg:w-1/2 flex flex-col justify-center p-16 bg-white bg-opacity-90 right-0 top-0 bottom-0 ml-auto">
        <h1 className="text-5xl font-extrabold text-black mb-6 leading-tight">
          Request Access
        </h1>
        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
          To access the UST-OSA Asset Management System, please sign in with
          your Google account. Your request will be sent to the administrator
          for approval.
        </p>

        {/* Conditionally Render Request Status */}
        {requestStatus && (
          <p className="text-lg text-gray-800 mb-4">{requestStatus}</p>
        )}

        {/* Google Login Button */}
        <GoogleOAuthProvider clientId={clientId}>
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={handleLoginFailure}
          />
        </GoogleOAuthProvider>

        {/* Back to Login Link */}
        <Link
          to="/"
          className="mt-8 text-gray-600 hover:text-gray-500 transition-colors duration-300"
        >
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}

export default EmailRequestForm;
