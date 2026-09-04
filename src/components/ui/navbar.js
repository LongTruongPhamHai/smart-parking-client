"use client";

import Link from "next/link";
import { LogOut, User, Car } from "lucide-react";
import { Button } from "./button";

export function Navbar({ user, title }) {
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-blue-600 flex items-center gap-2 hover:text-blue-700 transition-colors">
              <Car className="w-6 h-6" /> <span className="hidden sm:inline">Smart Parking</span>
            </Link>
            <span className="hidden sm:block text-gray-300">|</span>
            <span className="font-medium text-gray-800 text-lg">{title}</span>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-semibold text-gray-700">{user.name}</span>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">{user.role}</span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors shadow-sm">
              <LogOut className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

