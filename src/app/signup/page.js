"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* =======================
     HANDLE SIGNUP
  ======================= */
  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.detail || "Đăng ký thất bại");
      }

      // Đăng ký thành công → chuyển sang trang đăng nhập
      router.push("/signin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Đăng ký tài khoản
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              {/* NAME */}
              <div className="space-y-1">
                <Label>Họ và tên</Label>
                <Input
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* PHONE */}
              <div className="space-y-1">
                <Label>Số điện thoại</Label>
                <Input
                  placeholder="0123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              {/* PASSWORD */}
              <div className="space-y-1">
                <Label>Mật khẩu</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* ERROR */}
              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              {/* SUBMIT */}
              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-gray-800"
                disabled={loading}
              >
                {loading ? "Đang đăng ký..." : "Đăng ký"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
