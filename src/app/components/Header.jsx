"use client";

import { useEffect, useState } from "react";
import { Menu, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header({ onToggleMenu }) {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      try {
        setUserInfo(JSON.parse(storedUser));
      } catch {
        setUserInfo(null);
      }
    }
  }, []);

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-gray-900 text-white shadow">
      <div className="flex items-center gap-2">
        {/* Nút menu chỉ hiện trên mobile */}
        <button
          className="sm:hidden p-2 rounded hover:bg-gray-800"
          onClick={onToggleMenu}
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Hệ thống Bãi đỗ xe thông minh</h1>
      </div>

      {/* Phần user */}
      {userInfo ? (
        <div className="flex items-center gap-2">
          <User className="w-6 h-6" />
          <span>{userInfo.name}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/signin">
            <Button
              variant="default"
              className="bg-white text-black hover:bg-gray-200"
            >
              Đăng nhập
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              variant="default"
              className="bg-white text-black hover:bg-gray-200"
            >
              Đăng ký
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
