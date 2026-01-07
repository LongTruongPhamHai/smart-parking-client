"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* =======================
     FETCH INVOICES
  ======================= */
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/invoices/");
        if (!res.ok) throw new Error("Không tải được hóa đơn");

        const data = await res.json();
        setInvoices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total_price, 0);
  const todayRevenue = invoices
    .filter(
      (inv) =>
        inv.start_time.slice(0, 10) === new Date().toISOString().slice(0, 10)
    )
    .reduce((sum, inv) => sum + inv.total_price, 0);

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        <h1 className="text-3xl font-extrabold">📄 Danh sách hóa đơn</h1>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-2xl shadow-md">
            <CardContent className="p-6 space-y-2">
              <div className="text-gray-500 font-medium">Tổng doanh thu</div>
              <div className="text-3xl font-extrabold text-green-600">
                {totalRevenue.toLocaleString()} ₫
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md">
            <CardContent className="p-6 space-y-2">
              <div className="text-gray-500 font-medium">Doanh thu hôm nay</div>
              <div className="text-3xl font-extrabold text-blue-600">
                {todayRevenue.toLocaleString()} ₫
              </div>
            </CardContent>
          </Card>
        </div>

        {/* INVOICES TABLE */}
        <div className="overflow-x-auto mt-6">
          {loading ? (
            <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <table className="min-w-full bg-white rounded-2xl shadow-md">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                    ID
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                    User ID
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                    Start Time
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                    End Time
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                    Duration
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                    Unit Price
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                    Total Price
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4 text-sm">{inv.id}</td>
                    <td className="py-3 px-4 text-sm">{inv.user_id}</td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(inv.start_time).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {new Date(inv.end_time).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm">{inv.duration}</td>
                    <td className="py-3 px-4 text-sm">
                      {inv.unit_price.toLocaleString()} ₫
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold">
                      {inv.total_price.toLocaleString()} ₫
                    </td>
                    <td
                      className={`py-3 px-4 text-sm font-bold ${
                        inv.status === "paid"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {inv.status}
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
