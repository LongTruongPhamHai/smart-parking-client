"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Car, 
  Wallet, 
  User, 
  LogOut, 
  BarChart3, 
  Users, 
  Plus, 
  X, 
  Loader2, 
  FileText // <-- Đã thêm icon hóa đơn vào đây
} from "lucide-react";

export default function Page() {
  const [parkingSlots, setParkingSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // --- STATE CHO PHẦN NẠP TIỀN ---
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);

  /* =======================
      FETCH USER
  ======================= */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      setUserLoading(false);
      return;
    }

    const { id } = JSON.parse(storedUser);

    const fetchUser = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/users/by-id/${id}`);
        if (!res.ok) throw new Error();

        const data = await res.json();
        setCurrentUser(data);
      } catch {
        localStorage.removeItem("user");
      } finally {
        setUserLoading(false);
      }
    };

    fetchUser();
  }, []);

  /* =======================
      FETCH PARKING LOTS
  ======================= */
  useEffect(() => {
    const fetchParkingLots = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/parking-lots/");
        if (!res.ok) throw new Error();

        const data = await res.json();
        setParkingSlots(data);
      } catch (err) {
        setError("Không tải được bãi đỗ xe");
      } finally {
        setLoading(false);
      }
    };

    fetchParkingLots();
  }, []);

  /* =======================
      FETCH INVOICES (ADMIN)
  ======================= */
  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") return;

    const fetchInvoices = async () => {
      setInvoiceLoading(true);
      try {
        const res = await fetch("http://127.0.0.1:8000/invoices/");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setInvoices(data);
      } catch {
        console.error("Không tải được hóa đơn");
      } finally {
        setInvoiceLoading(false);
      }
    };

    fetchInvoices();
  }, [currentUser]);

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total_price, 0);
  const todayRevenue = invoices
    .filter(
      (inv) =>
        new Date(inv.start_time).toISOString().slice(0, 10) ===
        new Date().toISOString().slice(0, 10)
    )
    .reduce((sum, inv) => sum + inv.total_price, 0);

  /* =======================
      LOGOUT
  ======================= */
  const handleLogout = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
  };

  /* =======================
      HANDLE DEPOSIT (NẠP TIỀN)
  ======================= */
  const handleDeposit = async () => {
    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      alert("Nhập số tiền cho đàng hoàng vào anh ơi!");
      return;
    }

    setIsDepositing(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/users/${currentUser.id}/add-balance?amount=${depositAmount}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Lỗi nạp tiền");

      const updatedUser = await res.json();
      
      setCurrentUser(updatedUser);
      setDepositAmount("");
      setShowDeposit(false);
      alert("Đã nạp thành công! Giàu rồi!");
    } catch (error) {
      console.error(error);
      alert("Nạp tiền thất bại. Chắc server đang nghỉ trưa.");
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        {/* LEFT */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold">🚗 Bãi đỗ xe thông minh</h1>
          <p className="text-gray-600 max-w-xl">
            Theo dõi và quản lý trạng thái bãi đỗ xe theo thời gian thực.
          </p>
        </div>

        {/* RIGHT */}
        {!userLoading && (
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {!currentUser ? (
              <div className="flex gap-2">
                <Link href="/signup">
                  <Button className="bg-black text-white hover:bg-gray-800">
                    Đăng ký
                  </Button>
                </Link>
                <Link href="/signin">
                  <Button variant="outline">Đăng nhập</Button>
                </Link>
              </div>
            ) : (
              <Card className="w-80 rounded-2xl shadow-lg transition-all duration-300">
                <CardContent className="p-4 space-y-3">
                  {/* User Info Header */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 font-bold text-lg">
                      <User className="w-5 h-5" /> {currentUser.name}
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-200 font-bold uppercase">
                      {currentUser.role}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    📞 {currentUser.phone}
                  </div>

                  {/* Balance Display & Deposit Button */}
                  <div className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Wallet className="w-4 h-4 text-green-600" />
                      <span className="font-bold text-green-700">
                        {currentUser.balance?.toLocaleString()} ₫
                      </span>
                    </div>
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0 hover:bg-gray-200 rounded-full"
                        onClick={() => setShowDeposit(!showDeposit)}
                    >
                        {showDeposit ? <X className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
                    </Button>
                  </div>

                  {/* Form Nạp Tiền */}
                  {showDeposit && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-2 border-t pt-2"
                    >
                        <p className="text-xs font-semibold text-gray-500">Nạp thêm lúa:</p>
                        <div className="flex gap-2">
                            <Input 
                                type="number" 
                                placeholder="Nhập số tiền..." 
                                className="h-8 text-sm"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                            />
                            <Button 
                                size="sm" 
                                className="h-8 bg-green-600 hover:bg-green-700 text-white"
                                onClick={handleDeposit}
                                disabled={isDepositing}
                            >
                                {isDepositing ? <Loader2 className="w-3 h-3 animate-spin"/> : "Nạp"}
                            </Button>
                        </div>
                    </motion.div>
                  )}

                  {/* --- NÚT XEM HÓA ĐƠN MỚI THÊM VÀO --- */}
                  <div className="pt-2 mt-2 border-t">
                    <Link href="/invoices" className="w-full block">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <FileText className="w-4 h-4" /> Xem hóa đơn của tôi
                      </Button>
                    </Link>
                  </div>

                  <div className="flex justify-end pt-2 border-t">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleLogout}
                      className="w-full"
                    >
                      <LogOut className="w-4 h-4 mr-1" /> Đăng xuất
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </motion.header>

      {/* ADMIN DASHBOARD */}
      {currentUser?.role === "admin" && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto mt-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            📊 Bảng điều khiển Admin
          </h2>

          {invoiceLoading ? (
            <p className="text-center text-gray-500">Đang tải doanh thu...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-6 space-y-2">
                    <div className="flex items-center gap-2 text-gray-500">
                      <BarChart3 className="w-5 h-5" /> Tổng doanh thu
                    </div>
                    <div className="text-3xl font-extrabold text-green-600">
                      {totalRevenue.toLocaleString()} ₫
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-md">
                  <CardContent className="p-6 space-y-2">
                    <div className="flex items-center gap-2 text-gray-500">
                      📅 Doanh thu hôm nay
                    </div>
                    <div className="text-3xl font-extrabold text-blue-600">
                      {todayRevenue.toLocaleString()} ₫
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <Link href="/invoices">
                  <Button className="gap-2">
                    <BarChart3 className="w-4 h-4" /> Xem chi tiết hóa đơn
                  </Button>
                </Link>

                <Link href="/users">
                  <Button variant="outline" className="gap-2">
                    <Users className="w-4 h-4" /> Danh sách khách hàng
                  </Button>
                </Link>
              </div>
            </>
          )}
        </motion.section>
      )}

      {/* PARKING LOTS */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-6xl mx-auto mt-12"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Trạng thái bãi đỗ xe
        </h2>

        {loading && (
          <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
        )}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {parkingSlots.map((slot) => {
              const isAvailable = slot.status === "available";

              return (
                <Card
                  key={slot.id}
                  className={`border-2 rounded-2xl shadow-md transform hover:scale-105 transition-all ${
                    isAvailable
                      ? "border-green-400 bg-green-50"
                      : "border-red-300 bg-red-50"
                  }`}
                >
                  <CardContent className="p-6 flex flex-col items-center gap-4">
                    <Car
                      className={`w-12 h-12 ${
                        isAvailable ? "text-green-600" : "text-red-600"
                      }`}
                    />
                    <div className="text-xl font-black">{slot.name}</div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isAvailable
                          ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {isAvailable ? "Available" : "Occupied"}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!currentUser && (
          <p className="text-center text-sm text-gray-400 mt-8">
            * Đăng nhập để đặt chỗ và quản lý bãi đỗ xe
          </p>
        )}
      </motion.section>
    </main>
  );
}