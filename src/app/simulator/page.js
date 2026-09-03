"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import { LogIn, LogOut, Car, ArrowLeft, Flame, AlertTriangle } from "lucide-react";

export default function SimulatorPage() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  const [checkInPhone, setCheckInPhone] = useState("");
  const [checkInPassword, setCheckInPassword] = useState("");
  const [checkInLotId, setCheckInLotId] = useState("");
  const [availableLots, setAvailableLots] = useState([]);
  const [checkInResult, setCheckInResult] = useState(null);
  const [checkInError, setCheckInError] = useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const [checkOutPhone, setCheckOutPhone] = useState("");
  const [checkOutPassword, setCheckOutPassword] = useState("");
  const [checkOutResult, setCheckOutResult] = useState(null);
  const [checkOutError, setCheckOutError] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const [isSendingFire, setIsSendingFire] = useState(false);
  const [isSendingGas, setIsSendingGas] = useState(false);

  const fetchParkingLots = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/parking-lots/`);
      if (res.ok) {
        const data = await res.json();
        setAvailableLots(data.filter(lot => lot.status === "available"));
      }
    } catch (err) {
      console.error("Failed to fetch parking lots", err);
    }
  }, [BACKEND_URL]);

  useEffect(() => {
    fetchParkingLots();
  }, [fetchParkingLots]);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setIsCheckingIn(true);
    setCheckInResult(null);
    setCheckInError("");

    try {
      const bodyData = { phone: checkInPhone, password: checkInPassword };
      if (checkInLotId) {
        bodyData.parking_lot_id = checkInLotId;
      }
      
      const res = await fetch(`${BACKEND_URL}/users/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Check-in failed");
      }
      setCheckInResult(data);
      toast.success(data.message || "Check-in successful");
      fetchParkingLots(); // Refresh available lots
    } catch (err) {
      setCheckInError(err.message);
      toast.error(err.message);
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async (e) => {
    e.preventDefault();
    setIsCheckingOut(true);
    setCheckOutResult(null);
    setCheckOutError("");

    try {
      const res = await fetch(`${BACKEND_URL}/users/check-out`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: checkOutPhone, password: checkOutPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Check-out failed");
      }
      setCheckOutResult(data);
      toast.success(data.message || "Check-out successful");
      fetchParkingLots(); // Refresh available lots
    } catch (err) {
      setCheckOutError(err.message);
      toast.error(err.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleSendFireAlert = async () => {
    if (!confirm("Xác nhận kích hoạt giả lập CẢNH BÁO CHÁY khẩn cấp? Mail sẽ được gửi tới tất cả người dùng.")) {
      return;
    }
    setIsSendingFire(true);
    try {
      const res = await fetch(`${BACKEND_URL}/users/fire`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Gửi cảnh báo cháy thất bại");
      }
      toast.success("🔥 Cảnh báo cháy đã được kích hoạt thành công!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSendingFire(false);
    }
  };

  const handleSendGasAlert = async () => {
    if (!confirm("Xác nhận kích hoạt giả lập CẢNH BÁO RÒ RỈ GAS? Mail sẽ được gửi tới tất cả người dùng.")) {
      return;
    }
    setIsSendingGas(true);
    try {
      const res = await fetch(`${BACKEND_URL}/users/gas`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Gửi cảnh báo khí GAS thất bại");
      }
      toast.success("⚠️ Cảnh báo khí GAS đã được kích hoạt thành công!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSendingGas(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 space-y-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Check-In Simulator */}
        <Card className="rounded-2xl shadow-xl border-t-4 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <LogIn className="text-blue-500" /> Simulate Check-In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCheckIn} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="ci-phone">Phone Number</Label>
                <Input
                  id="ci-phone"
                  required
                  placeholder="Enter user phone"
                  value={checkInPhone}
                  onChange={(e) => setCheckInPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ci-pw">Password</Label>
                <Input
                  id="ci-pw"
                  type="password"
                  required
                  placeholder="Enter password"
                  value={checkInPassword}
                  onChange={(e) => setCheckInPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ci-lot">Parking Lot (Optional)</Label>
                <select
                  id="ci-lot"
                  className="w-full flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={checkInLotId}
                  onChange={(e) => setCheckInLotId(e.target.value)}
                >
                  <option value="">-- Auto Assign --</option>
                  {availableLots.map(lot => (
                    <option key={lot.id} value={lot.id}>{lot.name} (Available)</option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isCheckingIn}>
                {isCheckingIn ? "Processing..." : "Trigger Check-In"}
              </Button>

              {checkInError && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm mt-4">
                  {checkInError}
                </div>
              )}
              {checkInResult && (
                <div className="p-3 bg-green-100 text-green-800 rounded-md text-sm mt-4">
                  <p className="font-bold">✅ {checkInResult.message}</p>
                  <p>Invoice ID: {checkInResult.invoice_id}</p>
                  <p>Start Time: {checkInResult.start_time}</p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Check-Out Simulator */}
        <Card className="rounded-2xl shadow-xl border-t-4 border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <LogOut className="text-green-500" /> Simulate Check-Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCheckOut} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="co-phone">Phone Number</Label>
                <Input
                  id="co-phone"
                  required
                  placeholder="Enter user phone"
                  value={checkOutPhone}
                  onChange={(e) => setCheckOutPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="co-pw">Password</Label>
                <Input
                  id="co-pw"
                  type="password"
                  required
                  placeholder="Enter password"
                  value={checkOutPassword}
                  onChange={(e) => setCheckOutPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isCheckingOut}>
                {isCheckingOut ? "Processing..." : "Trigger Check-Out"}
              </Button>

              {checkOutError && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm mt-4">
                  {checkOutError}
                </div>
              )}
              {checkOutResult && (
                <div className="p-3 bg-green-100 text-green-800 rounded-md text-sm mt-4 space-y-1">
                  <p className="font-bold">✅ {checkOutResult.message}</p>
                  <p>Invoice ID: {checkOutResult.invoice_id}</p>
                  <p>Start: {checkOutResult.start_time}</p>
                  <p>End: {checkOutResult.end_time}</p>
                  <p className="text-lg font-bold text-green-900 mt-2">
                    Total: {checkOutResult.total_amount?.toLocaleString()}₫
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Emergency IoT Alert Simulator */}
      <Card className="max-w-4xl w-full rounded-2xl shadow-xl border-t-4 border-red-500 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-red-600">
            <AlertTriangle className="text-red-500" /> Mô phỏng Cảnh báo Khẩn cấp (Emergency Alerts)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Kích hoạt mô phỏng tín hiệu cảnh báo từ cảm biến IoT. Khi nhấn kích hoạt, hệ thống sẽ tự động gửi email cảnh báo tới <strong>tất cả người dùng</strong> có email trong hệ thống.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Button
              onClick={handleSendFireAlert}
              disabled={isSendingFire}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-6 text-base rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              {isSendingFire ? "Đang gửi cảnh báo cháy..." : "🔥 Giả lập Cảnh báo Cháy"}
            </Button>

            <Button
              onClick={handleSendGasAlert}
              disabled={isSendingGas}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-6 text-base rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              {isSendingGas ? "Đang gửi cảnh báo GAS..." : "⚠️ Giả lập Cảnh báo Khí GAS"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <a href="/" className="absolute top-6 left-6 text-gray-500 hover:text-gray-900 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm transition-all hover:shadow">
        <ArrowLeft className="w-5 h-5" /> Back to Home
      </a>
    </main>
  );
}
