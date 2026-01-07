"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  /* =======================
     HANDLE SIGNUP
  ======================= */
  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.detail || "Signup failed");
      }

      // Success → redirect to sign in page
      router.push("/signin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-2xl shadow-lg bg-white/70 backdrop-blur-md border border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-gray-900">
              Create an Account
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              {/* NAME */}
              <div className="space-y-1">
                <Label>Full Name</Label>
                <Input
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* EMAIL */}
              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* PHONE */}
              <div className="space-y-1">
                <Label>Phone Number</Label>
                <Input
                  placeholder="0123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              {/* PASSWORD */}
              <div className="space-y-1">
                <Label>Password</Label>
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
                className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold py-2 rounded-full shadow-lg hover:scale-105 transition-transform"
                disabled={loading}
              >
                {loading ? "Signing up..." : "Sign Up"}
              </Button>

              {/* NAVIGATION LINKS */}
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <Link
                  href="/"
                  className="hover:text-blue-600 transition-colors"
                >
                  Back to Home
                </Link>
                <Link
                  href="/signin"
                  className="hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
