"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, Wallet, User, LogOut } from "lucide-react";

function formatDurationFromHours(hoursFloat) {
  const totalSeconds = Math.floor(hoursFloat * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function CustomerPage() {
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  const [currentUser, setCurrentUser] = useState(null);
  const [parkingSlots, setParkingSlots] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // Deposit
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);

  // ======================
  // FETCH USER INFO
  // ======================
  const fetchUser = useCallback(async () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    const { id } = JSON.parse(storedUser);

    try {
      const res = await fetch(`${BACKEND_URL}/users/by-id/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCurrentUser(data);
    } catch {
      localStorage.removeItem("user");
    }
  }, [BACKEND_URL]);

  // ======================
  // FETCH PARKING LOTS
  // ======================
  const fetchParking = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/parking-lots/`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setParkingSlots(data);
    } catch (err) {
      console.error("Failed to load parking slots", err);
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL]);

  // ======================
  // FETCH USER INVOICES
  // ======================
  const fetchInvoices = useCallback(async () => {
    if (!currentUser) return;

    setInvoiceLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/invoices/user/${currentUser.id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error("Failed to load invoices", err);
    } finally {
      setInvoiceLoading(false);
    }
  }, [BACKEND_URL, currentUser]);

  // ======================
  // INITIAL FETCH
  // ======================
  useEffect(() => {
    fetchUser();
    fetchParking();
  }, [fetchUser, fetchParking]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // ======================
  // LOGOUT
  // ======================
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  // ======================
  // HANDLE DEPOSIT
  // ======================
  const handleDeposit = async () => {
    if (
      !depositAmount ||
      isNaN(Number(depositAmount)) ||
      Number(depositAmount) <= 0
    ) {
      alert("Please enter a valid amount!");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to deposit ${Number(
          depositAmount
        ).toLocaleString()}₫ to your account?`
      )
    )
      return;

    setIsDepositing(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/users/${currentUser.id}/add-balance?amount=${depositAmount}`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );
      if (!res.ok) throw new Error("Deposit failed");

      // Refresh user info & invoices after successful deposit
      await fetchUser();
      await fetchInvoices();

      setDepositAmount("");
      setShowDeposit(false);
      alert("Deposit successful!");
    } catch (err) {
      alert(err.message);
    } finally {
      setIsDepositing(false);
    }
  };

  if (!currentUser)
    return <p className="text-center mt-12">Loading user information...</p>;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Customer Dashboard</h1>
        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-1" /> Logout
        </Button>
      </div>

      {/* CUSTOMER INFO */}
      <Card className="mb-8 rounded-2xl shadow-md">
        <CardContent className="space-y-2">
          <h2 className="text-xl font-bold">User Information</h2>
          <p>Name: {currentUser.name}</p>
          <p>Email: {currentUser.email}</p>
          <p>Phone number: {currentUser.phone}</p>
          <p>Role: {currentUser.role}</p>
          <p>Balance: {currentUser.balance?.toLocaleString()}₫</p>

          {/* DEPOSIT */}
          <div className="mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDeposit(!showDeposit)}
            >
              {showDeposit ? "Cancel" : "Deposit"}
            </Button>
            {showDeposit && (
              <div className="mt-2 flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="Enter amount..."
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
                  {isDepositing ? "Processing..." : "Submit"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PARKING SLOTS */}
      <h2 className="text-2xl font-bold mb-4">Parking Slot Status</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {parkingSlots.map((slot) => (
          <Card key={slot.id} className="rounded-2xl shadow-md">
            <CardContent className="flex flex-col items-center gap-3">
              <Car
                className={`w-10 h-10 ${
                  slot.status === "available"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              />
              <p className="font-bold">{slot.name}</p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  slot.status === "available"
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {slot.status === "available" ? "Available" : "Occupied"}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* INVOICES */}
      <h2 className="text-2xl font-bold mb-4">My Invoices</h2>
      {invoiceLoading ? (
        <p>Loading invoices...</p>
      ) : invoices.length === 0 ? (
        <p className="text-center text-gray-500 py-4">No invoices yet!</p>
      ) : (
        <div className="overflow-x-auto mb-8">
          <table className="w-full table-auto border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Start</th>
                <th className="p-2 border">End</th>
                <th className="p-2 border">Duration</th>
                <th className="p-2 border">Total</th>
                <th className="p-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="text-center border-t">
                  <td className="p-2 border">{inv.id}</td>
                  <td className="p-2 border">
                    {new Date(inv.start_time).toLocaleString()}
                  </td>
                  <td className="p-2 border">
                    {inv.end_time
                      ? new Date(inv.end_time).toLocaleString()
                      : "Processing"}
                  </td>
                  <td className="p-2 border">
                    {inv.duration
                      ? formatDurationFromHours(inv.duration)
                      : "On process"}
                  </td>
                  <td className="p-2 border">
                    {inv.total_price
                      ? `${inv.total_price.toLocaleString()}₫`
                      : "Processing"}
                  </td>
                  <td className="p-2 border">{inv.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
