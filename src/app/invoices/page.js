"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText, Wallet, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  /* =======================
      FETCH LOGIC (PHÂN QUYỀN)
  ======================= */
  useEffect(() => {
    // 1. Kiểm tra xem có ai ở nhà không (Check LocalStorage)
    const storedUserRaw = localStorage.getItem("user");
    
    if (!storedUserRaw) {
      // Không có user thì mời về chuồng (Login)
      router.push("/signin"); 
      return;
    }

    const user = JSON.parse(storedUserRaw);
    setCurrentUser(user);

    const fetchInvoices = async () => {
      try {
        let url = "";

        // 2. Phân loại giai cấp để chọn API
        if (user.role === "admin") {
          // Admin: Xem hết thiên hạ
          url = "http://127.0.0.1:8000/invoices/";
        } else {
          // Dân thường: Chỉ xem của mình
          // Endpoint theo format anh đưa: /invoices/user/{id}
          url = `http://127.0.0.1:8000/invoices/user/${user.id}`;
        }

        const res = await fetch(url);
        
        if (!res.ok) {
           // Handle trường hợp user mới chưa có hóa đơn nào (404) hoặc lỗi server
           if (res.status === 404) {
             setInvoices([]); // Không có hóa đơn thì trả về mảng rỗng
             return; 
           }
           throw new Error("Không tải được hóa đơn. Server dỗi rồi.");
        }

        const data = await res.json();
        // API trả về object hay array? Đề phòng trả về 1 object lẻ
        setInvoices(Array.isArray(data) ? data : [data]); 
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [router]);

  // Tính toán tiền nong
  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total_price || 0), 0);
  
  // Tính tiền hôm nay (Check kỹ null/undefined để không crash app)
  const todayAmount = invoices
    .filter((inv) => {
        if (!inv.start_time) return false;
        return inv.start_time.slice(0, 10) === new Date().toISOString().slice(0, 10)
    })
    .reduce((sum, inv) => sum + (inv.total_price || 0), 0);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header & Back Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
                <Link href="/">
                    <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-blue-600 gap-2">
                        <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
                    </Button>
                </Link>
                <h1 className="text-3xl font-extrabold flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600"/>
                    {currentUser?.role === 'admin' ? "Quản lý Hóa Đơn (Admin)" : "Hóa Đơn Của Tôi"}
                </h1>
            </div>
        </div>

        {/* STATS AREA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-2xl shadow-sm border-l-4 border-l-green-500">
            <CardContent className="p-6 space-y-2">
              <div className="text-gray-500 font-medium flex items-center gap-2">
                <Wallet className="w-4 h-4"/> 
                {currentUser?.role === 'admin' ? "Tổng doanh thu toàn hệ thống" : "Tổng tiền đã 'cúng' cho bãi xe"}
              </div>
              <div className="text-3xl font-extrabold text-green-600">
                {totalAmount.toLocaleString()} ₫
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm border-l-4 border-l-blue-500">
            <CardContent className="p-6 space-y-2">
              <div className="text-gray-500 font-medium flex items-center gap-2">
                <CalendarDays className="w-4 h-4"/> 
                {currentUser?.role === 'admin' ? "Doanh thu hôm nay" : "Tiền bay màu hôm nay"}
              </div>
              <div className="text-3xl font-extrabold text-blue-600">
                {todayAmount.toLocaleString()} ₫
              </div>
            </CardContent>
          </Card>
        </div>

        {/* INVOICES TABLE */}
        <div className="overflow-x-auto mt-6 bg-white rounded-2xl shadow-lg border border-gray-100">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
                Đang lục lọi dữ liệu... 🕵️‍♂️
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500 font-bold bg-red-50 rounded-2xl">
                ⚠️ Lỗi rồi đại vương ơi: {error}
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
                Chưa có hóa đơn nào. {currentUser?.role !== 'admin' && "Chúc mừng, ví bạn vẫn an toàn!"}
            </div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                  {currentUser?.role === 'admin' && (
                      <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User ID</th>
                  )}
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vào bến</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ra bến</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Thời lượng</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Đơn giá</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Thành tiền</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-blue-50/50 transition duration-150 ease-in-out"
                  >
                    <td className="py-4 px-6 text-sm text-gray-600 font-mono">#{inv.id.toString().slice(-6)}</td>
                    
                    {currentUser?.role === 'admin' && (
                        <td className="py-4 px-6 text-sm text-gray-600 font-mono" title={inv.user_id}>
                            {inv.user_id.toString().slice(0, 8)}...
                        </td>
                    )}

                    <td className="py-4 px-6 text-sm text-gray-700">
                      {new Date(inv.start_time).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {inv.end_time ? new Date(inv.end_time).toLocaleString('vi-VN') : "Chưa ra"}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 font-medium">{inv.duration}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {inv.unit_price?.toLocaleString()} ₫
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-gray-900">
                      {inv.total_price?.toLocaleString()} ₫
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm ${
                        inv.status === "paid"
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-red-100 text-red-700 border border-red-200"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </main>
  );
}