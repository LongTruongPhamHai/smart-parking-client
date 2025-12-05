"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [form, setForm] = useState({
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://127.0.0.1:8000/users/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: form.phone,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.detail || "Đăng nhập thất bại");
      } else {
        setMessage("Đăng nhập thành công!");

        // Lưu thông tin user vào localStorage
        localStorage.setItem("userInfo", JSON.stringify(data));
        localStorage.setItem("role", data.role);

        setTimeout(() => {
          if (data.role === "customer") {
            window.location.href = `/customer/${data.id}`;
          } else if (data.role === "admin") {
            window.location.href = `/admin/${data.id}`;
          } else {
            window.location.href = "/";
          }
        }, 1000);
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
          Đăng nhập
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

          <Button
            type="submit"
            className="w-full mt-2 bg-black text-white hover:bg-gray-800"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>

        <div className="text-center mt-4 flex flex-col gap-2">
          <Button
            variant="link"
            className="text-gray-600 hover:text-black"
            onClick={() => (window.location.href = "/signup")}
          >
            Chưa có tài khoản? Đăng ký
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
