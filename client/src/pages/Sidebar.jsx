import React, { useState } from "react";
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
  faFontAwesomeFlag,
  faQrcode,
  faBoxOpen,
  faTools,
  faExclamationTriangle,
  faChevronDown,
  faChevronUp,
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

  const isSubItemActive =
    subItems && subItems.some((item) => item.to === location.pathname);

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
            isActive || isSubItemActive ? "text-yellow-500" : "text-white"
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
      { text: "Asset Maintenance", to: "/asset-maintenance", icon: faTools },
      { text: "Asset Issue", to: "/asset-issue", icon: faExclamationTriangle },
      { text: "Asset Request", to: "/asset-request", icon: faBoxOpen },
      { text: "Archived Requests", to: "/archived-requests", icon: faClipboardList },
    ],
  },
  { text: "Borrowing Request", to: "/borrowingrequest", icon: faClipboardList },
  { text: "Supplier Lists", to: "/supplierlist", icon: faUsers },
  {
    text: "Events Management",
    to: "/events",
    icon: faCalendarAlt,
    subItems: [
      { text: "Active Events", to: "/events", icon: faCalendarAlt },
      { text: "Completed Events", to: "/completed-events", icon: faClipboardList },
    ],
  },
  { text: "User Management", to: "/users", icon: faUserCog },
  { text: "Role Management", to: "/roles", icon: faFontAwesomeFlag },
  { text: "Generate QR", to: "/qr", icon: faQrcode },
];

const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    </>
  );
};

export default Sidebar;
