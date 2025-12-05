"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setMessage("Mật khẩu và xác nhận mật khẩu không khớp.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://127.0.0.1:8000/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.detail || "Đăng ký thất bại");
      } else {
        setMessage("Đăng ký thành công! Chuyển sang đăng nhập...");
        setTimeout(() => {
          window.location.href = "/signin";
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setMessage("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-xl shadow-md p-8 w-full max-w-md border border-gray-200"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Đăng ký tài khoản
        </h2>

        {message && (
          <div
            className={`p-2 mb-4 text-center rounded ${
              message.includes("thành công")
                ? "bg-gray-900 text-white"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label className="text-gray-700 mb-2">Họ và tên</Label>
            <Input
              type="text"
              name="name"
              placeholder="Nguyễn Văn A"
              value={form.name}
              onChange={handleChange}
              required
              className="border-gray-300 focus:border-black focus:ring-black"
            />
          </div>

          <div>
            <Label className="text-gray-700 mb-2">Email</Label>
            <Input
              type="email"
              name="email"
              placeholder="email@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className="border-gray-300 focus:border-black focus:ring-black"
            />
          </div>

          <div>
            <Label className="text-gray-700 mb-2">Số điện thoại</Label>
            <Input
              type="tel"
              name="phone"
              placeholder="0912345678"
              value={form.phone}
              onChange={handleChange}
              required
              className="border-gray-300 focus:border-black focus:ring-black"
            />
          </div>

          <div>
            <Label className="text-gray-700 mb-2">Mật khẩu</Label>
            <Input
              type="password"
              name="password"
              placeholder="Nhập mật khẩu"
              value={form.password}
              onChange={handleChange}
              required
              className="border-gray-300 focus:border-black focus:ring-black"
            />
          </div>

          <div>
            <Label className="text-gray-700 mb-2">Xác nhận mật khẩu</Label>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="border-gray-300 focus:border-black focus:ring-black"
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-2 bg-black text-white hover:bg-gray-800"
            disabled={loading}
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </Button>
        </form>

        <div className="text-center mt-4 flex flex-col gap-2">
          <Button
            variant="link"
            className="text-gray-600 hover:text-black"
            onClick={() => (window.location.href = "/signin")}
          >
            Đã có tài khoản? Đăng nhập
          </Button>
          <Button
            variant="outline"
            className="border-black text-black hover:bg-gray-100"
            onClick={() => (window.location.href = "/")}
          >
            Quay lại
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
