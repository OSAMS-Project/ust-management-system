import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom";
import "./App.css";
import Events from "./pages/eventslist";
import AssetList from "./pages/assetlist";
import UserManagement from "./pages/usermanagement";
import FinanceTracking from "./pages/financetracking";
import SupplierList from "./pages/supplierlist";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/LoginPage";
import Sidebar from "./components/navbar/navbar";
import AdminForm from "./pages/AdminLogin";
import EmailRequestForm from "./pages/RequestPage";
import BorrowerForm from "./pages/BorrowerPage";
import ProfilePage from "./pages/Profile";
import BorrowingRequest from "./pages/BorrowingRequest";
import RoleManagement from "./pages/RoleManagement";
import QRPage from "./pages/QRPage";
function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    const adminToken = sessionStorage.getItem('adminToken');
    return savedUser ? JSON.parse(savedUser) : (adminToken ? { role: 'admin' } : null);
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <Router>
      <AppContent user={user} setUser={setUser} />
    </Router>
  );
}

function AppContent({ user, setUser }) {
  const location = useLocation();
  const isPublicRoute = ["/", "/login", "/request", "/borrow", "/admin"].includes(location.pathname);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Redirect logged-in users to dashboard if they try to access public routes
  if (user && isPublicRoute) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="app-container">
      {user && <Sidebar user={user} onLogout={handleLogout} />}
      <div className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicRoute user={user}><SignIn setUser={setUser} /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute user={user}><SignIn setUser={setUser} /></PublicRoute>} />
          <Route path="/request" element={<PublicRoute user={user}><EmailRequestForm /></PublicRoute>} />
          <Route path="/borrow" element={<PublicRoute user={user}><BorrowerForm /></PublicRoute>} />
          <Route path="/admin" element={<PublicRoute user={user}><AdminForm setUser={setUser} /></PublicRoute>} />
          
          {/* Private Routes */}
          <Route path="/dashboard" element={<PrivateRoute user={user}><Dashboard user={user} /></PrivateRoute>} />
          <Route path="/events" element={<PrivateRoute user={user}><Events /></PrivateRoute>} />
          <Route path="/assets" element={<PrivateRoute user={user}><AssetList /></PrivateRoute>} />
          <Route path="/borrowingrequest" element={<PrivateRoute user={user}><BorrowingRequest /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute user={user}><UserManagement /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute user={user}><ProfilePage user={user} /></PrivateRoute>} />
          <Route path="/financetracking" element={<PrivateRoute user={user}><FinanceTracking /></PrivateRoute>} />
          <Route path="/supplierlist" element={<PrivateRoute user={user}><SupplierList /></PrivateRoute>} />
          <Route path="/roles" element={<PrivateRoute user={user}><RoleManagement /></PrivateRoute>} />
          <Route path="/qr" element={<PrivateRoute user={user}><QRPage /></PrivateRoute>} />
        </Routes>
      </div>
    </div>
  );
}

// Private Route Component
function PrivateRoute({ user, children }) {
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ user, children }) {
  return !user ? children : <Navigate to="/dashboard" replace />;
}

export default App;
