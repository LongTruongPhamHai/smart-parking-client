"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center space-y-6"
      >
        {/* Logo / Icon */}
        <Car className="w-20 h-20 text-blue-600" />

        {/* Tên hệ thống */}
        <h1 className="text-4xl font-bold text-gray-800 text-center">
          Hệ thống Bãi đỗ xe Thông minh
        </h1>
        <p className="text-gray-600 text-center max-w-md">
          Quản lý chỗ đỗ, thanh toán nhanh chóng và giám sát phương tiện dễ
          dàng.
        </p>

        {/* Nút Đăng nhập / Đăng ký */}
        <div className="flex space-x-4">
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => (window.location.href = "/signin")}
          >
            Đăng nhập
          </Button>
          <Button
            className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            onClick={() => (window.location.href = "/signup")}
          >
            Đăng ký
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
