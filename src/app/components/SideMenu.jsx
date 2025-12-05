import { motion } from "framer-motion";
import {
  Home,
  Car,
  Settings,
  User,
  LogIn,
  Users,
  X,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function SideMenu({ isOpen, onClose }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      setIsLoggedIn(true);
      const storedRole = localStorage.getItem("role");
      if (storedRole) setRole(storedRole);
    } else {
      setIsLoggedIn(false);
      setRole(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setRole(null);
    window.location.href = "/";
    if (onClose) onClose();
  };

  const renderMenuItems = () => {
    if (!isLoggedIn) {
      // chưa đăng nhập
      return (
        <>
          <MenuItem
            icon={<Home />}
            label="Trang chủ"
            onClick={() => (window.location.href = "/")}
          />
          <MenuItem
            icon={<LogIn />}
            label="Đăng nhập / Đăng ký"
            onClick={() => (window.location.href = "/signin")}
          />
        </>
      );
    }

    if (role === "customer") {
      return (
        <>
          <MenuItem
            icon={<Home />}
            label="Trang chủ"
            onClick={() => (window.location.href = "/")}
          />
          <MenuItem icon={<Car />} label="Quản lý xe" />
          <MenuItem icon={<User />} label="Hồ sơ" />
          <MenuItem
            icon={<LogOut />}
            label="Đăng xuất"
            onClick={handleLogout}
          />
        </>
      );
    }

    if (role === "admin") {
      return (
        <>
          <MenuItem
            icon={<Home />}
            label="Trang chủ"
            onClick={() => (window.location.href = "/")}
          />
          <MenuItem icon={<Car />} label="Quản lý xe" />
          <MenuItem icon={<Users />} label="Quản lý người dùng" />
          <MenuItem icon={<Settings />} label="Cài đặt" />
          <MenuItem
            icon={<LogOut />}
            label="Đăng xuất"
            onClick={handleLogout}
          />
        </>
      );
    }
  };

  return (
    <>
      {/* Desktop menu */}
      <aside className="hidden sm:block w-64 bg-gray-100 border-r border-gray-300 p-4">
        <nav className="space-y-4">{renderMenuItems()}</nav>
      </aside>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-y-0 left-0 w-64 bg-gray-100 border-r border-gray-300 p-4 z-50 sm:hidden"
        >
          <button
            className="absolute top-2 right-2 p-2 rounded hover:bg-gray-200"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
          <nav className="mt-8 space-y-4">{renderMenuItems()}</nav>
        </motion.div>
      )}
    </>
  );
}

// Component nhỏ cho item
function MenuItem({ icon, label, onClick }) {
  return (
    <div
      className="flex items-center gap-2 text-gray-800 hover:text-black cursor-pointer"
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}
