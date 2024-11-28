import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

function AdminForm({ setUser }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  // Use environment variables for admin credentials
  const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD;  

  useEffect(() => {
    const adminToken = sessionStorage.getItem("adminToken");
    if (adminToken) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Simulate an API call with a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Set admin token in sessionStorage
        sessionStorage.setItem("adminToken", "admin-logged-in");
        // Set user in localStorage and update state
        const adminUser = { role: "Administrator", email: ADMIN_EMAIL };
        localStorage.setItem("user", JSON.stringify(adminUser));
        setUser(adminUser);
        navigate("/dashboard");
      } else {
        setError("Invalid email or password.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-screen overflow-hidden lg:overflow-auto">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: "url('./ust-img-9.jpg')" }}
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

      {/* Right Section - Admin Login Form */}
      <div className="relative w-full lg:w-1/2 flex flex-col justify-start lg:justify-center p-6 lg:p-16 bg-white bg-opacity-90 overflow-y-auto">
        {/* Logo */}
        <img
          src="/ust-logo.png"
          alt="UST Logo"
          className="mb-4 w-20 h-20 lg:w-24 lg:h-24"
        />

        {/* Title */}
        <h1 className="text-4xl lg:text-5xl font-extrabold text-black mb-1 leading-tight">
          Admin Login
        </h1>

        {/* Description */}
        <p className="text-lg lg:text-xl text-gray-600 mb-6 leading-relaxed">
          Administrator Account for the UST-OSA Asset Management System
        </p>

        {/* Login Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-6">
          {/* Username Field */}
          <div className="relative">
            <input
              type="text"
              id="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              className="block w-full px-4 py-3 border-b-2 border-gray-300 bg-transparent text-lg text-black tracking-wide focus:border-black focus:outline-none transition-colors duration-300 peer"
            />
            <label
              htmlFor="email"
              className="absolute left-4 top-3 text-gray-500 duration-300 transform -translate-y-8 scale-75 origin-0 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-8"
            >
              Enter your username
            </label>
          </div>

          {/* Password Field */}
          <div className="relative">
            <input
              type="password"
              id="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              className="block w-full px-4 py-3 border-b-2 border-gray-300 bg-transparent text-lg text-black tracking-wide focus:border-black focus:outline-none transition-colors duration-300 peer"
            />
            <label
              htmlFor="password"
              className="absolute left-4 top-3 text-gray-500 duration-300 transform -translate-y-8 scale-75 origin-0 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:scale-75 peer-focus:-translate-y-8"
            >
              Enter your password
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex text-red-500 mb-6">
              <FontAwesomeIcon
                icon={faExclamationCircle}
                className="mr-2 mt-1"
              />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${
              isLoading ? "bg-gray-400" : "bg-black"
            } text-white text-lg font-medium py-3 rounded-md hover:bg-gray-900 transition-colors duration-300 transform hover:scale-105 tracking-wider`}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Divider Line */}
        <hr className="border-gray-300 mb-4 mt-4" />

        {/* Back to Login Link */}
        <Link
          to="/"
          className="text-gray-600 hover:text-gray-500 transition-colors duration-300 flex items-center"
        >
          <FontAwesomeIcon icon={faHome} className="mr-2 font-xl" />
          Return to Login
        </Link>
      </div>
    </div>
  );
}

export default AdminForm;
