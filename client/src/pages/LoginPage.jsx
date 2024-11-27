import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
// const hostedDomain = 'ust.edu.ph';

function SignIn({ setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("Credential Response Decoded:", decoded);

      // Check if the user exists in the database
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/check`,
        {
          email: decoded.email,
        }
      );

      if (response.data.exists) {
        const user = response.data.user;

        // Check if the user has access
        if (user.access) {
          // Fetch permissions for the user
          const permissionsResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/users/${user.id}/permissions`
          );

          const permissions = permissionsResponse.data.permissions || [];
          console.log("Fetched Permissions:", permissions);

          // Update user with permissions
          const updatedUser = {
            ...decoded,
            id: user.id, // Ensure ID is included
            role: user.role,
            permissions,
          };

          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));

          // Navigate to return URL if it exists, otherwise go to dashboard
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
    <div className="relative flex h-screen w-screen overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('./ust-image.JPG')" }}
      >
{/* <img src="/logo.png" alt="UST Background" className="absolute inset-0 w-full h-full object-cover object-center" /> */}

      </div>

      {/* Google Login Form Section */}
      <div className="relative w-full lg:w-1/2 flex flex-col justify-center p-16 bg-white bg-opacity-90 right-0 top-0 bottom-0 ml-auto">
        <img src="/ust-logo.png" alt="UST Logo" className="mb-2 w-24 h-24" />{" "}
        {/* Adjust size as needed */}
        <h1 className="text-5xl font-extrabold text-black mb-4">Login</h1>
        <p className="text-xl text-600 mb-4 leading-relaxed">
          To access the UST-OSA Asset Management System, kindly sign in using
          your Google Account below. Click the "Login" button to sign in.
        </p>
        {/* Error Message */}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {/* Google Login Button */}
        <GoogleOAuthProvider clientId={clientId}>
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={handleLoginFailure}
            hd={"ust.edu.ph"}
          />
        </GoogleOAuthProvider>
        {/* Buttons Side-by-Side */}
        <div className="flex justify-between gap-4 mt-8">
          <Link to="/request" className="">
            Request Access
          </Link>
          <Link
            to="/borrow"
            className=""
          >
            Borrow here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
