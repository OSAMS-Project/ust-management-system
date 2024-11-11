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

const NavItem = ({ to, text, icon, isActive, subItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isSubItemActive = subItems && subItems.some(item => {
    if (item.subItems) {
      return item.subItems.some(subItem => subItem.to === location.pathname);
    }
    return item.to === location.pathname;
  });
  
  const shouldHighlight = isActive || isSubItemActive;

  const toggleSubmenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  if (subItems) {
    return (
      <div className="relative">
        <Link
          to={to}
          className={`flex items-center w-full p-3 rounded-md transition duration-200 ${
            shouldHighlight ? "text-yellow-500" : "text-white"
          }`}
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
        {isOpen && (
          <div className="pl-6 mt-2 space-y-2 submenu">
            {subItems.map((item) => (
              <NavItem
                key={item.text}
                {...item}
                isActive={location.pathname === item.to}
              />
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
      { text: "Asset Issues", to: "/asset-issue", icon: faExclamationTriangle },
      { text: "Asset Request", to: "/asset-request", icon: faBoxOpen },
      { text: "Archived Requests", to: "/archived-requests", icon: faClipboardList },
      { text: "Incoming Assets", to: "/incoming-assets", icon: faTruckFast },
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
      { text: "Completed Events", to: "/completed-events", icon: faClipboardList },
    ],
  },
  { 
    text: "User Management", 
    to: "/users", 
    icon: faUserCog,
    subItems: [
      { text: "Role Management", to: "/roles", icon: faUsers },
    ],
  },
];

const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTimeoutModalOpen, setIsTimeoutModalOpen] = useState(false);

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

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimeout);
    });

    resetTimeout();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (warningTimeoutId) clearTimeout(warningTimeoutId);
      events.forEach(event => {
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

  return (
    <>
      <div className="h-screen w-64 bg-[#202020] shadow-lg flex flex-col">
        <div className="flex items-center justify-center p-4">
          <img src="/logo.png" alt="Logo" className="w-40 h-auto" />
        </div>

        <Link
          to="/profile"
          className="flex items-center p-4 border-b border-gray-700"
        >
          <img
            src={user?.picture || "https://via.placeholder.com/50"}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="ml-3 flex-1 min-w-0">
            <span className="block font-semibold text-[#FEC00F] uppercase whitespace-nowrap overflow-hidden text-ellipsis">
              {user?.name ?? "ROLE"}
            </span>
            <span className="block text-sm text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">
              {user?.role || "Admin"}
            </span>
          </div>
        </Link>

        <nav className="flex-1 p-4 space-y-2">
          {MENU_LIST.map((menu) => (
            <NavItem
              key={menu.text}
              {...menu}
              isActive={location.pathname === menu.to}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <NavItem to="/settings" text="Settings" icon={faCog} />
          <button
            onClick={handleLogoutClick}
            className="flex items-center p-3 text-white rounded-md transition duration-200"
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
            <h2 className="text-xl font-bold mb-4 text-red-600">Session Timeout Warning</h2>
            <p className="mb-6 text-gray-700">
              Your session will expire in a few seconds due to inactivity. Please click continue to stay logged in.
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
