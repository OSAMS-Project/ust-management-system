import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode"; 
import axios from "axios";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function SignIn({ setUser }) {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("Credential Response Decoded:", decoded);
  
      // Check if the user exists in the database
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/check`, {
        email: decoded.email
      });
  
      if (response.data.exists) {
        const user = response.data.user;
  
        // Check if the user has access
        if (user.access) {
          setUser(decoded);
          navigate('/dashboard');
        } else {
          // User exists but does not have access
          setError("Access denied. Please contact the administrator for access.");
        }
      } else {
        // User doesn't exist, show error message
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
<div className="relative flex h-screen w-screen overflow-hidden">
  {/* Background Image */}
  <div
    className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
    style={{ backgroundImage: "url('./ust-image.JPG')" }}
  ></div>

  {/* Google Login Form Section */}
  <div className="relative w-full lg:w-1/2 flex flex-col justify-center p-16 bg-white bg-opacity-90 right-0 top-0 bottom-0 ml-auto">
  <img src="/ust-logo.png" alt="UST Logo" className="mb-2 w-24 h-24" /> {/* Adjust size as needed */}
    <h1 className="text-5xl font-extrabold text-black mb-4">Login</h1>
    
    <p className="text-xl text-600 mb-4 leading-relaxed">
      To access the UST-OSA Asset Management System, kindly sign in using your Google Account below. Click the "Login" button to sign in.
    </p>

    {/* Error Message */}
    {error && <p className="text-red-500 mb-4">{error}</p>}

    {/* Google Login Button */}
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={handleLoginFailure}
      />
    </GoogleOAuthProvider>

    {/* Buttons Side-by-Side */}
    {/* <div className="flex justify-between gap-4 mt-8">
      <Link
        to="/email"
        className="flex-1 text-center text-white bg-blue-600 hover:bg-blue-700 font-medium py-3 px-6 rounded transition duration-300"
      >
        No Access Yet? Request Access
      </Link>

      <Link
        to="/admin"
        className="flex-1 text-center text-white bg-gray-600 hover:bg-gray-700 font-medium py-3 px-6 rounded transition duration-300"
      >
        Admin? Click here
      </Link>

      <Link
        to="/borrower"
        className="flex-1 text-center text-white bg-green-600 hover:bg-green-700 font-medium py-3 px-6 rounded transition duration-300"
      >
        Borrow here
      </Link>
    </div> */}
  </div>

</div>

  );
}

export default SignIn;