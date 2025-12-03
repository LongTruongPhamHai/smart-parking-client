"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: validate & submit API
    console.log("Đăng ký:", form);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Đăng ký tài khoản
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              name="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label>Số điện thoại</Label>
            <Input
              type="tel"
              name="phone"
              placeholder="0912345678"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label>Mật khẩu</Label>
            <Input
              type="password"
              name="password"
              placeholder="Nhập mật khẩu"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label>Xác nhận mật khẩu</Label>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
          >
            Đăng ký
          </Button>
        </form>

        <div className="text-center mt-4">
          <Button
            variant="link"
            className="text-gray-500 hover:text-blue-600"
            onClick={() => (window.location.href = "/signin")}
          >
            Đã có tài khoản? Đăng nhập
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
