"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [form, setForm] = useState({
    phone: "", // Chỉ số điện thoại
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

        // Lưu token / session nếu có
        // localStorage.setItem("token", data.access_token);

        // Điều hướng dựa vào role
        const role = data.role; // backend cần trả về field 'role'

        setTimeout(() => {
          if (role === "customer") {
            window.location.href = `/customer/${data.id}`;
          } else if (role === "admin") {
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

        {message && (
          <div
            className={`p-2 mb-4 text-center rounded ${
              message.includes("thành công")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
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

          <Button
            type="submit"
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
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
