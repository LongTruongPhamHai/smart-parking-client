"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import {
  Chart,
  Line,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
import { Line as LineChart } from "react-chartjs-2";
import { useParams } from "next/navigation";

// Register chart.js components
Chart.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

export default function CustomerPage() {
  const params = useParams();
  const { id } = params;

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Dữ liệu tạm thời giả lập
    const mockData = {
      user: {
        id,
        name: "Nguyễn Văn A",
        email: "vana@example.com",
        phone: "0912345678",
        role: "customer",
      },
      vehicles: [
        { plate: "30A-123.45", type: "Xe máy", registeredAt: "2025-01-01" },
        { plate: "29B-987.65", type: "Ô tô", registeredAt: "2025-03-15" },
      ],
      wallet: { balance: 250000 },
      parkingHistory: [
        { date: "2025-11-01", location: "Bãi A", amount: 20000 },
        { date: "2025-11-03", location: "Bãi B", amount: 15000 },
        { date: "2025-11-07", location: "Bãi A", amount: 18000 },
        { date: "2025-11-10", location: "Bãi C", amount: 22000 },
        { date: "2025-11-15", location: "Bãi B", amount: 20000 },
      ],
    };
    setUserData(mockData);
  }, [id]);

  if (!userData) return <div>Loading...</div>;

  // Chuẩn bị dữ liệu cho biểu đồ
  const chartData = {
    labels: userData.parkingHistory.map((h) => h.date),
    datasets: [
      {
        label: "Thanh toán (VNĐ)",
        data: userData.parkingHistory.map((h) => h.amount),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.4,
      },
    ],
  };

  return (
    <motion.div
      className="p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin khách hàng</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <strong>Họ tên:</strong> {userData.user.name}
          </div>
          <div>
            <strong>Email:</strong> {userData.user.email}
          </div>
          <div>
            <strong>Số điện thoại:</strong> {userData.user.phone}
          </div>
          <div>
            <strong>Vai trò:</strong>{" "}
            {userData.user.role === "customer" ? "Khách hàng" : "Admin"}
          </div>
        </CardContent>
      </Card>

      {/* Vehicles */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin phương tiện</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2">Biển số</th>
                <th className="p-2">Loại xe</th>
                <th className="p-2">Ngày đăng ký</th>
              </tr>
            </thead>
            <tbody>
              {userData.vehicles.map((v, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-2">{v.plate}</td>
                  <td className="p-2">{v.type}</td>
                  <td className="p-2">{v.registeredAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Wallet */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin tài khoản</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-semibold">
            Số dư ví: {userData.wallet.balance.toLocaleString()} VNĐ
          </div>
        </CardContent>
      </Card>

      {/* Parking History */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử đỗ xe / thanh toán</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart data={chartData} />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Ngày</th>
                  <th className="p-2">Bãi đỗ</th>
                  <th className="p-2">Số tiền (VNĐ)</th>
                </tr>
              </thead>
              <tbody>
                {userData.parkingHistory.map((h, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2">{h.date}</td>
                    <td className="p-2">{h.location}</td>
                    <td className="p-2">{h.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
