import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Events from "./pages/EventsList";
import AssetList from "./pages/AssetList";
import UserManagement from "./pages/UserManagement";
import SupplierList from "./pages/SupplierList";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/LoginPage";
import Sidebar from "./pages/Sidebar";
import AdminForm from "./pages/AdminLogin";
import EmailRequestForm from "./pages/RequestPage";
import BorrowerForm from "./pages/BorrowerPage";
import ProfilePage from "./pages/Profile";
import BorrowingRequest from "./pages/BorrowingRequest";
import AssetRequest from "./pages/AssetRequest";
import AssetRepair from "./pages/AssetRepair";
import AssetIssue from "./pages/AssetIssue";
import CompletedEvents from "./pages/CompletedEvents";
import ArchivedRequests from "./pages/ArchivedRequests";
import IncomingAssets from "./pages/IncomingAssets";
import BorrowingHistory from "./pages/BorrowingHistory";
import RoleManagement from "./pages/RoleManagement";
import ScanRedirect from "./components/scan/ScanRedirect";
<<<<<<< Updated upstream
import AssetDetailsPage from "./pages/AssetDetailsPage";
import AssetMaintenance from "./pages/AssetMaintenance";
=======
import AssetDetailsPage from './pages/AssetDetailsPage';
import FileUpload from './components/FileUpload';
>>>>>>> Stashed changes

console.log("Supabase URL:", process.env.REACT_APP_SUPABASE_URL);
console.log("API URL:", process.env.REACT_APP_API_URL);

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    const adminToken = sessionStorage.getItem("adminToken");
    return savedUser
      ? JSON.parse(savedUser)
      : adminToken
      ? { role: "admin" }
      : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
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
  const isPublicRoute = [
    "/",
    "/login",
    "/request",
    "/borrow",
    "/admin",
  ].includes(location.pathname);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // Redirect logged-in users to dashboard if they try to access public routes
  if (user && isPublicRoute) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="app-container flex h-screen">
      {user && <Sidebar user={user} onLogout={handleLogout} />}
      <div className="main-content flex-1 overflow-auto">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute user={user}>
                <SignIn setUser={setUser} />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute user={user}>
                <SignIn setUser={setUser} />
              </PublicRoute>
            }
          />
          <Route
            path="/request"
            element={
              <PublicRoute user={user}>
                <EmailRequestForm />
              </PublicRoute>
            }
          />
          <Route
            path="/borrow"
            element={
              <PublicRoute user={user}>
                <BorrowerForm />
              </PublicRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PublicRoute user={user}>
                <AdminForm setUser={setUser} />
              </PublicRoute>
            }
          />

          {/* Private Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute user={user}>
                <Dashboard user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/events"
            element={
              <PrivateRoute user={user}>
                <Events />
              </PrivateRoute>
            }
          />
          <Route
            path="/completed-events"
            element={
              <PrivateRoute user={user}>
                <CompletedEvents />
              </PrivateRoute>
            }
          />
          <Route
            path="/assets"
            element={
              <PrivateRoute user={user}>
                <AssetList user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/asset-repair"
            element={
              <PrivateRoute user={user}>
                <AssetRepair />
              </PrivateRoute>
            }
          />
          <Route
            path="/asset-issue"
            element={
              <PrivateRoute user={user}>
                <AssetIssue user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/borrowingrequest"
            element={
              <PrivateRoute user={user}>
                <BorrowingRequest />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute user={user}>
                <UserManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/roles"
            element={
              <PrivateRoute user={user}>
                <RoleManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute user={user}>
                <ProfilePage user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/supplierlist"
            element={
              <PrivateRoute user={user}>
                <SupplierList />
              </PrivateRoute>
            }
          />
          <Route
            path="/asset-request"
            element={
              <PrivateRoute user={user}>
                <AssetRequest user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/archived-requests"
            element={
              <PrivateRoute user={user}>
                <ArchivedRequests user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/incoming-assets"
            element={
              <PrivateRoute user={user}>
                <IncomingAssets />
              </PrivateRoute>
            }
          />
          <Route
            path="/borrowing-history"
            element={
              <PrivateRoute user={user}>
                <BorrowingHistory />
              </PrivateRoute>
            }
          />
          <Route
            path="/repair"
            element={
              <PrivateRoute user={user}>
                <AssetRepair />
              </PrivateRoute>
            }
          />
          <Route
            path="/asset-maintenance"
            element={
              <PrivateRoute user={user}>
                <AssetMaintenance user={user} />
              </PrivateRoute>
            }
          />
          <Route path="/scan/:assetId" element={<ScanRedirect />} />
          <Route
            path="/assets/details/:assetId"
            element={
              <PrivateRoute user={user}>
                <AssetDetailsPage />
              </PrivateRoute>
            }
          />
          <Route path="/file-upload" element={<PrivateRoute user={user}><FileUpload /></PrivateRoute>} />
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
