import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationCircle,
  faQuestionCircle,
  faTools,
} from "@fortawesome/free-solid-svg-icons";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function SignIn({ setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("Credential Response Decoded:", decoded);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/check`,
        {
          email: decoded.email,
        }
      );

      if (response.data.exists) {
        const user = response.data.user;

        if (user.access) {
          const permissionsResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/users/${user.id}/permissions`
          );

          const permissions = permissionsResponse.data.permissions || [];
          console.log("Fetched Permissions:", permissions);

          const updatedUser = {
            ...decoded,
            id: user.id,
            role: user.role,
            permissions,
          };

          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));

          const params = new URLSearchParams(location.search);
          const returnUrl = params.get("returnUrl");
          navigate(returnUrl || "/dashboard");
        } else {
          setError(
            "Access denied. Please contact the administrator for access."
          );
        }
      } else {
        setError("User not found. Please request access.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred during login. Please try again.");
    }
  };

  const handleLoginFailure = (error) => {
    console.error("Error logging in:", error);
    setError("Login failed. Please try again.");
  };

  return (
    <div className="relative flex h-screen w-screen overflow-hidden lg:overflow-auto">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: "url('./ust-image.JPG')" }}
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
          Login
        </h1>

        {/* Description */}
        <p className="text-lg lg:text-xl text-gray-600 mb-6 leading-relaxed">
          To access the UST-OSA Asset Management System, kindly sign in using
          your Google Account below. Click the "Login" button to sign in.
        </p>

        {/* Google Login Button */}
        <GoogleOAuthProvider clientId={clientId}>
          <div className="mb-4">
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={handleLoginFailure}
              hd={"ust.edu.ph"}
            />
          </div>
        </GoogleOAuthProvider>

        {/* Error Message */}
        {error && (
          <div className="flex text-red-500 mb-6">
            <FontAwesomeIcon icon={faExclamationCircle} className="mr-2 mt-1" />
            <span>{error}</span>
          </div>
        )}

        {/* Divider Line */}
        <hr className="border-gray-300 mb-6" />

        {/* Anchor Links */}
        <div className="text-sm text-gray-500 flex justify-between items-center">
          {/* Help Section */}
          <Link to="/request" className="flex items-center">
            <FontAwesomeIcon icon={faQuestionCircle} className="mr-2" />
            <span>Need help signing in?</span>
            <span className="text-blue-600 ml-2">Request Access</span>
          </Link>

          {/* Return Home Section */}
          <Link to="/borrow" className="flex items-center">
            <FontAwesomeIcon icon={faTools} className="mr-2 text-blue-600" />
            <span className="text-blue-600">Borrow Assets</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
