"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import {
  LogIn,
  LogOut,
  Car,
  ArrowLeft,
  Flame,
  AlertTriangle,
  Radio,
  CheckCircle2,
  XCircle,
  Phone,
  Lock,
  Cpu,
} from "lucide-react";
import Link from "next/link";

export default function SimulatorPage() {
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

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
        setAvailableLots(data.filter((lot) => lot.status === "available"));
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
      fetchParkingLots();
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
        body: JSON.stringify({
          phone: checkOutPhone,
          password: checkOutPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Check-out failed");
      }
      setCheckOutResult(data);
      toast.success(data.message || "Check-out successful");
      fetchParkingLots();
    } catch (err) {
      setCheckOutError(err.message);
      toast.error(err.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleSendFireAlert = async () => {
    if (
      !confirm(
        "Are you sure you want to trigger the EMERGENCY FIRE ALERT? Email notifications will be sent to all users.",
      )
    ) {
      return;
    }
    setIsSendingFire(true);
    try {
      const res = await fetch(`${BACKEND_URL}/users/fire`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.detail || "Failed to send fire alarm notification",
        );
      }
      toast.success("🔥 Fire Alarm broadcasted successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSendingFire(false);
    }
  };

  const handleSendGasAlert = async () => {
    if (
      !confirm(
        "Are you sure you want to trigger the GAS LEAK ALERT? Email notifications will be sent to all users.",
      )
    ) {
      return;
    }
    setIsSendingGas(true);
    try {
      const res = await fetch(`${BACKEND_URL}/users/gas`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to send gas leak notification");
      }
      toast.success("⚠️ Gas Leak Alert broadcasted successfully!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSendingGas(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-8 font-sans relative overflow-hidden">
      {/* Light Ambient Background Glow */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl w-full space-y-8 relative z-10 my-12">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
              <Cpu className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                IoT & Gate Simulator
              </h1>
              <p className="text-xs text-slate-500">
                Simulate vehicle entry/exit barrier control & Fire Alarm sensors
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-4 py-2.5 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Gate Simulation Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Check-In Simulator */}
          <Card className="rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-xl overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-5">
              <CardTitle className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <LogIn className="w-5 h-5" />
                </div>
                Simulate Gate Check-In (Vehicle Entry)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleCheckIn} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="ci-phone"
                    className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
                  >
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <Input
                      id="ci-phone"
                      required
                      placeholder="Enter user phone number"
                      value={checkInPhone}
                      onChange={(e) => setCheckInPhone(e.target.value)}
                      className="pl-10 bg-slate-50/50 border-slate-200 rounded-xl text-sm h-11 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="ci-pw"
                    className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <Input
                      id="ci-pw"
                      type="password"
                      required
                      placeholder="Enter password"
                      value={checkInPassword}
                      onChange={(e) => setCheckInPassword(e.target.value)}
                      className="pl-10 bg-slate-50/50 border-slate-200 rounded-xl text-sm h-11 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="ci-lot"
                    className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
                  >
                    Parking Slot
                  </Label>
                  <div className="relative">
                    <Car className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 z-10" />
                    <select
                      id="ci-lot"
                      className="pl-10 w-full flex h-11 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={checkInLotId}
                      onChange={(e) => setCheckInLotId(e.target.value)}
                    >
                      <option value="">-- Auto Assign Slot --</option>
                      {availableLots.map((lot) => (
                        <option key={lot.id} value={lot.id}>
                          {lot.name} (Available)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all mt-2"
                  disabled={isCheckingIn}
                >
                  {isCheckingIn ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Triggering Gate...</span>
                    </div>
                  ) : (
                    "Trigger Check-In"
                  )}
                </Button>

                {checkInError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-medium flex items-start gap-2">
                    <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{checkInError}</span>
                  </div>
                )}

                {checkInResult && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{checkInResult.message}</span>
                    </div>
                    <div className="pt-2 border-t border-emerald-200/60 text-slate-600 space-y-1">
                      <p>
                        <span className="font-semibold text-slate-800">
                          Invoice ID:
                        </span>{" "}
                        #{checkInResult.invoice_id}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-800">
                          Start Time:
                        </span>{" "}
                        {checkInResult.start_time}
                      </p>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Check-Out Simulator */}
          <Card className="rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 bg-white/90 backdrop-blur-xl overflow-hidden">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-5">
              <CardTitle className="flex items-center gap-2.5 text-lg font-bold text-slate-800">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <LogOut className="w-5 h-5" />
                </div>
                Simulate Gate Check-Out (Vehicle Exit)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleCheckOut} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="co-phone"
                    className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
                  >
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <Input
                      id="co-phone"
                      required
                      placeholder="Enter user phone number"
                      value={checkOutPhone}
                      onChange={(e) => setCheckOutPhone(e.target.value)}
                      className="pl-10 bg-slate-50/50 border-slate-200 rounded-xl text-sm h-11 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="co-pw"
                    className="text-xs font-semibold text-slate-600 uppercase tracking-wider"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <Input
                      id="co-pw"
                      type="password"
                      required
                      placeholder="Enter password"
                      value={checkOutPassword}
                      onChange={(e) => setCheckOutPassword(e.target.value)}
                      className="pl-10 bg-slate-50/50 border-slate-200 rounded-xl text-sm h-11 focus:bg-white"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all mt-2"
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Opening Gate...</span>
                    </div>
                  ) : (
                    "Trigger Check-Out"
                  )}
                </Button>

                {checkOutError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-medium flex items-start gap-2">
                    <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{checkOutError}</span>
                  </div>
                )}

                {checkOutResult && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{checkOutResult.message}</span>
                    </div>
                    <div className="pt-2 border-t border-emerald-200/60 text-slate-600 space-y-1">
                      <p>
                        <span className="font-semibold text-slate-800">
                          Invoice ID:
                        </span>{" "}
                        #{checkOutResult.invoice_id}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-800">
                          Check-in:
                        </span>{" "}
                        {checkOutResult.start_time}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-800">
                          Check-out:
                        </span>{" "}
                        {checkOutResult.end_time}
                      </p>
                      <p className="text-sm font-black text-emerald-700 pt-1">
                        Total Paid:{" "}
                        {checkOutResult.total_amount?.toLocaleString()}₫
                      </p>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Emergency IoT Alert Simulator */}
        <Card className="rounded-3xl border-2 border-rose-200 bg-rose-50/30 shadow-xl shadow-rose-100/50 overflow-hidden">
          <CardHeader className="bg-rose-100/50 border-b border-rose-200/60 p-5">
            <CardTitle className="flex items-center justify-between text-lg font-bold text-rose-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-500 text-white rounded-xl shadow-xs animate-pulse">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                Simulate Emergency Signals (IoT Alarm System)
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold bg-rose-200/80 text-rose-800 px-3 py-1 rounded-full">
                <Radio className="w-3.5 h-3.5 animate-ping text-rose-600" />{" "}
                Active Sensors
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Trigger simulated emergency alarm signals from the parking lot's
              IoT sensors. When activated, the system automatically sends urgent
              notifications to <strong>all registered users</strong> via Email
              Service.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Button
                onClick={handleSendFireAlert}
                disabled={isSendingFire}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-14 text-sm rounded-2xl shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                {isSendingFire
                  ? "Sending Fire Alarm..."
                  : "🔥 Simulate Fire Alarm"}
              </Button>

              <Button
                onClick={handleSendGasAlert}
                disabled={isSendingGas}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-14 text-sm rounded-2xl shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                {isSendingGas
                  ? "Sending Gas Alert..."
                  : "⚠️ Simulate Gas Leak Alert"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
