"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [form, setForm] = useState({
    identifier: "", // email hoặc phone
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: validate & submit API
    console.log("Đăng nhập:", form);
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
          Đăng nhập
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label>Email hoặc Số điện thoại</Label>
            <Input
              type="text"
              name="identifier"
              placeholder="email@example.com hoặc 0912345678"
              value={form.identifier}
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

          <Button
            type="submit"
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
          >
            Đăng nhập
          </Button>
        </form>

        <div className="text-center mt-4">
          <Button
            variant="link"
            className="text-gray-500 hover:text-blue-600"
            onClick={() => (window.location.href = "/signup")}
          >
            Chưa có tài khoản? Đăng ký
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
