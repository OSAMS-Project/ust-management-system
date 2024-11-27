import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faList,
  faUsers,
  faCalendarAlt,
  faUserCog,
  faCog,
  faSignOutAlt,
  faClipboardList,
  faExclamationTriangle,
  faChevronDown,
  faChevronUp,
  faTruckFast,
  faHistory,
  faTools,
  faBoxOpen,
  faTimes,
  faBars,
  faWrench,
  faArchive,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";

// Modal Component
const Modal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[1000]">
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-bold mb-4">Confirm Sign Out</h2>
        <p>Are you sure you want to sign out?</p>
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="mr-4 text-gray-500">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
const NavItem = ({
  to,
  text,
  icon,
  subItems,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Check if the current route matches the main link's route
  const isActive = location.pathname === to;

  // Check if any sub-item is active
  const isSubItemActive =
    subItems && subItems.some((item) => location.pathname === item.to);

  // Highlight main nav link if it's active or any sub-item is active
  const shouldHighlight = isActive || isSubItemActive;

  const toggleSubmenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleClick = () => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false); // Close mobile menu on item click
    }
  };

  if (subItems) {
    return (
      <div className="relative">
        {/* Main Nav Link */}
        <Link
          to={to}
          className={`flex items-center w-full p-3 rounded-md transition duration-200 ${
            shouldHighlight ? "text-yellow-500" : "text-white"
          }`}
          onClick={handleClick} // Close menu on item click
        >
          <FontAwesomeIcon icon={icon} className="mr-3" />
          <span className="font-medium">{text}</span>
          <button
            onClick={toggleSubmenu}
            className="ml-auto focus:outline-none"
          >
            <FontAwesomeIcon
              icon={isOpen ? faChevronUp : faChevronDown}
              className="transition-transform duration-300"
            />
          </button>
        </Link>

        {/* Sub-Nav Links */}
        {isOpen && (
          <div
            className={`space-y-1 ${
              isMobileMenuOpen
                ? "grid grid-cols-2 gap-2 px-6" // Two-column grid for mobile mode
                : "pl-6" // Standard layout for desktop
            }`}
          >
            {subItems.map((item) => (
              <Link
                key={item.text}
                to={item.to}
                className={`flex items-center p-2 text-sm rounded-md transition ${
                  location.pathname === item.to
                    ? "text-yellow-500" // Highlight active sub-item
                    : "text-gray-300 hover:text-yellow-500" // Default style
                }`}
                onClick={handleClick} // Close menu on sub-item click
              >
                <FontAwesomeIcon icon={item.icon} className="mr-2" />
                <span className="whitespace-nowrap">{item.text}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={to}
      className={`flex items-center p-3 rounded-md transition duration-200 ${
        isActive ? "text-yellow-500" : "text-white"
      }`}
      onClick={handleClick} // Close menu when clicked
    >
      <FontAwesomeIcon icon={icon} className="mr-3" />
      <span className="font-medium">{text}</span>
    </Link>
  );
};

const MENU_LIST = [
  { text: "Dashboard", to: "/dashboard", icon: faHome },
  {
    text: "Asset Lists",
    to: "/assets",
    icon: faList,
    subItems: [
      { text: "Asset Repair", to: "/asset-repair", icon: faTools },
      {
        text: "Asset Issues",
        to: "/asset-issues",
        icon: faExclamationTriangle,
      },
      { text: "Asset Request", to: "/asset-request", icon: faBoxOpen },
      {
        text: "Archived Requests",
        to: "/archived-requests",
        icon: faArchive,
      },
      { text: "Incoming Assets", to: "/incoming-assets", icon: faTruckFast },
      { text: "Asset Maintenance", to: "/asset-maintenance", icon: faWrench },
    ],
  },
  {
    text: "Borrowing Request",
    to: "/borrowingrequest",
    icon: faClipboardList,
    subItems: [
      { text: "Borrowing History", to: "/borrowing-history", icon: faHistory },
    ],
  },
  { text: "Supplier Lists", to: "/supplierlist", icon: faUsers },
  {
    text: "Events Management",
    to: "/events",
    icon: faCalendarAlt,
    subItems: [
      { text: "Upcoming Events", to: "/events", icon: faCalendarAlt },
      {
        text: "Completed Events",
        to: "/completed-events",
        icon: faClipboardList,
      },
    ],
  },
  {
    text: "User Management",
    to: "/users",
    icon: faUserCog,
    subItems: [{ text: "Role Management", to: "/roles", icon: faUsers }],
  },
];

const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Hamburger toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For hamburger toggle
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTimeoutModalOpen, setIsTimeoutModalOpen] = useState(false);

  // Extract permissions from user
  const permissions = user?.permissions || [];
  const isAdmin = user?.role === "Administrator";

  // Filter menu items based on permissions if not admin
  const filteredMenuList = isAdmin
    ? MENU_LIST // Admin sees full menu
    : MENU_LIST.map((menu) => ({
        ...menu,
        subItems: menu.subItems
          ? menu.subItems.filter((subItem) =>
              permissions.includes(subItem.text)
            )
          : null,
      })).filter(
        (menu) =>
          permissions.includes(menu.text) ||
          (menu.subItems && menu.subItems.length > 0)
      );

  // Debug the filtered menu list
  useEffect(() => {
    console.log("Filtered Menu List:", filteredMenuList);
  }, [permissions, isAdmin]);

  useEffect(() => {
    let timeoutId;
    let warningTimeoutId;

    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (warningTimeoutId) clearTimeout(warningTimeoutId);

      // Show warning 30 seconds before timeout (9.5 minutes)
      warningTimeoutId = setTimeout(() => {
        setIsTimeoutModalOpen(true);
      }, 570000); // 9.5 minutes

      // Actual timeout (10 minutes)
      timeoutId = setTimeout(() => {
        handleConfirmLogout();
      }, 600000); // 10 minutes
    };

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) => {
      document.addEventListener(event, resetTimeout);
    });

    resetTimeout();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (warningTimeoutId) clearTimeout(warningTimeoutId);
      events.forEach((event) => {
        document.removeEventListener(event, resetTimeout);
      });
    };
  }, []);

  const handleLogoutClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmLogout = () => {
    sessionStorage.clear();
    onLogout();
    setIsModalOpen(false);
  };

  // Log the user object for debugging
  useEffect(() => {
    console.log("User Object:", user);
    console.log("User Permissions:", user?.permissions);
  }, [user]);

  return (
    <>
      {/* Responsive Sidebar/Navbar */}
      <div className="lg:hidden fixed top-0 w-full bg-[#202020] text-gray-200 z-20">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link to="/dashboard" className="text-yellow-500 text-xl font-bold">
            UST-OSA
          </Link>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-200"
          >
            <FontAwesomeIcon
              icon={isMobileMenuOpen ? faTimes : faBars}
              size="lg"
            />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="bg-[#202020] ">
            {/* Mobile Profile Section */}
            <Link
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)} // Close menu on profile click
              className="flex items-center p-4 border-b border-gray-700"
            >
              <img
                src={user?.picture || "/osa-img.png"}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="ml-3">
                <span className="block font-semibold text-[#FEC00F] uppercase">
                  {user?.name ?? "UST-OSA"}
                </span>
                <span className="block text-sm text-gray-400">
                  {user?.role || "No Role"}
                </span>
              </div>
            </Link>

            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-2 py-4 px-4">
              {filteredMenuList.map((menu) => (
                <NavItem
                  key={menu.text}
                  {...menu}
                  isActive={location.pathname === menu.to}
                  isMobileMenuOpen={isMobileMenuOpen}
                  setIsMobileMenuOpen={setIsMobileMenuOpen}
                />
              ))}
              <NavItem
                to="/settings"
                text="Settings"
                icon={faCog}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
              />
              <button
                onClick={() => {
                  handleLogoutClick();
                  setIsMobileMenuOpen(false); // Close menu on logout
                }}
                className="flex items-center px-4 py-2 text-gray-300 hover:text-yellow-500"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                Sign Out
              </button>
            </nav>
          </div>
        )}
      </div>
      <div className="hidden lg:flex h-screen w-64 bg-[#202020] text-gray-200 flex-col lg:w-72 xl:w-80">
        {/* Logo and Profile Section */}
        <div className="flex items-center justify-center p-4">
          <Link to="/dashboard">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-32 h-auto lg:w-40 xl:w-48"
            />
          </Link>
        </div>
        <Link
          to="/profile"
          className="flex items-center p-4 border-b border-gray-700 hover:bg-[#282828]"
        >
          <img
            src={user?.picture || "/osa-img.png"}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="ml-3 flex-1">
            <span className="block font-semibold text-[#FEC00F] uppercase whitespace-nowrap overflow-hidden text-ellipsis">
              {user?.name ?? "UST-OSA"}
            </span>
            <span className="block text-sm text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">
              {user?.role || "No Role"}
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {filteredMenuList.map((menu) => (
            <NavItem
              key={menu.text}
              {...menu}
              isActive={location.pathname === menu.to}
            />
          ))}
        </nav>

        {/* Footer Links */}
        <div className="p-4 border-t border-gray-700">
          <NavItem to="/settings" text="Settings" icon={faCog} />
          <button
            onClick={handleLogoutClick}
            className="flex items-center p-3 text-white rounded-md transition duration-200 hover:bg-[#282828]"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />

      {isTimeoutModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-red-600">
              Session Timeout Warning
            </h2>
            <p className="mb-6 text-gray-700">
              Your session will expire in a few seconds due to inactivity.
              Please click continue to stay logged in.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsTimeoutModalOpen(false);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Continue Session
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
