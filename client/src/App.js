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
import AssetDetailsPage from "./pages/AssetDetailsPage";
import AssetMaintenance from "./pages/AssetMaintenance";
import FileUpload from "./components/FileUpload";
import Settings from "./pages/Settings";
import axios from "axios";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem("adminToken") === "admin-logged-in";
  });

  useEffect(() => {
    const fetchPermissionsForUser = async () => {
      if (!user || !user.id || user.permissions) {
        return; // Don't fetch if permissions already exist or user ID is missing
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/users/${user.id}/permissions`
        );
        if (!response.ok) throw new Error("Failed to fetch permissions.");

        const data = await response.json();
        console.log("Fetched Permissions:", data.permissions);
        setUser((prevUser) => ({ ...prevUser, permissions: data.permissions }));
      } catch (err) {
        console.error("Failed to fetch permissions:", err);
      }
    };

    fetchPermissionsForUser();
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Periodically check user's access status
  useEffect(() => {
    const checkAccessStatus = async () => {
      if (!user || !user.id) return;

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/${user.id}`
        );

        if (!response.data.user.access) {
          console.warn("User access revoked. Logging out...");
          handleLogout();
        }
      } catch (error) {
        console.error("Error checking access status:", error);
      }
    };

    const interval = setInterval(checkAccessStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

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

  // Enhanced PrivateRoute with permission checks
  function PrivateRoute({ user, requiredPermissions = [], children }) {
    const isAdmin = user?.role === "Administrator"; // Check if user is admin
    const hasPermission =
      isAdmin ||
      requiredPermissions.every((perm) => user?.permissions?.includes(perm));

    if (!user) {
      return <Navigate to="/login" />;
    }

    if (requiredPermissions.length > 0 && !hasPermission) {
      return <Navigate to="/dashboard" />;
    }

    return children;
  }

  const isPrivateRoute = user && !isPublicRoute;

  return (
    <div className="app-container flex h-screen">
      {user && <Sidebar user={user} onLogout={handleLogout} />}
      <div
        className={`main-content flex-1 overflow-auto ${
          isPrivateRoute ? "pt-10 lg:pt-0" : ""
        }`}
      >
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

          <Route
            path="/users"
            element={
              <PrivateRoute
                user={user}
                requiredPermissions={["User Management"]}
              >
                <UserManagement user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/events"
            element={
              <PrivateRoute
                user={user}
                requiredPermissions={["Events Management"]}
              >
                <Events />
              </PrivateRoute>
            }
          />
          <Route
            path="/assets"
            element={
              <PrivateRoute user={user} requiredPermissions={["Asset Lists"]}>
                <AssetList user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/roles"
            element={
              <PrivateRoute
                user={user}
                requiredPermissions={["Role Management"]}
              >
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
            path="/dashboard"
            element={
              <PrivateRoute user={user}>
                <Dashboard user={user} />
              </PrivateRoute>
            }
          />

          <Route
            path="/completed-events"
            element={
              <PrivateRoute
                user={user}
                requiredPermissions={["Completed Events"]}
              >
                <CompletedEvents />
              </PrivateRoute>
            }
          />

          <Route
            path="/supplierlist"
            element={
              <PrivateRoute
                user={user}
                requiredPermissions={["Supplier Lists"]}
              >
                <SupplierList />
              </PrivateRoute>
            }
          />
          <Route
            path="/asset-request"
            element={
              <PrivateRoute user={user} requiredPermissions={["Asset Request"]}>
                <AssetRequest user={user} />
              </PrivateRoute>
            }
          />

          <Route
            path="/asset-issues"
            element={
              <PrivateRoute user={user} requiredPermissions={["Asset Issues"]}>
                <AssetIssue user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/archived-requests"
            element={
              <PrivateRoute
                user={user}
                requiredPermissions={["Archived Requests"]}
              >
                <ArchivedRequests user={user} />
              </PrivateRoute>
            }
          />
          <Route
            path="/incoming-assets"
            element={
              <PrivateRoute
                user={user}
                requiredPermissions={["Incoming Assets"]}
              >
                <IncomingAssets />
              </PrivateRoute>
            }
          />
          <Route
            path="/borrowing-history"
            element={
              <PrivateRoute
                user={user}
                requiredPermissions={["Borrowing History"]}
              >
                <BorrowingHistory />
              </PrivateRoute>
            }
          />
          <Route
            path="/borrowingrequest"
            element={
              <PrivateRoute
                user={user}
                requiredPermissions={["Borrowing Requests"]}
              >
                <BorrowingRequest />
              </PrivateRoute>
            }
          />
          <Route
            path="/asset-repair"
            element={
              <PrivateRoute user={user} requiredPermissions={["Asset Repair"]}>
                <AssetRepair />
              </PrivateRoute>
            }
          />
          <Route
            path="/asset-maintenance"
            element={
              <PrivateRoute
                user={user}
                requiredPermissions={["Asset Maintenance"]}
              >
                <AssetMaintenance user={user} />
              </PrivateRoute>
            }
          />
          <Route path="/scan/:assetId" element={<ScanRedirect />} />
          <Route
            path="/assets/details/:assetId"
            element={
              <PrivateRoute user={user} requiredPermissions={["Asset List"]}>
                <AssetDetailsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/file-upload"
            element={
              <PrivateRoute user={user}>
                <FileUpload />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute user={user}>
                <Settings user={user} />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

function PublicRoute({ user, children }) {
  return !user ? children : <Navigate to="/dashboard" replace />;
}

export default App;
