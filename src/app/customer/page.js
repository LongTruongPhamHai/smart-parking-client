"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/ui/navbar";
import { toast } from "react-hot-toast";
import { Car, Wallet, User, LogOut, Edit, KeyRound, Plus, Receipt } from "lucide-react";

function formatDurationFromHours(hoursFloat) {
  const totalSeconds = Math.floor(hoursFloat * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function formatDateToGMT7(datetimeString) {
  if (!datetimeString) return "Processing";
  const date = new Date(datetimeString);

  const dateUTC7 = new Date(date.getTime() + 7 * 60 * 60 * 1000);

  const pad = (n) => String(n).padStart(2, "0");

  const y = dateUTC7.getFullYear();
  const m = pad(dateUTC7.getMonth() + 1);
  const d = pad(dateUTC7.getDate());
  const h = pad(dateUTC7.getHours());
  const min = pad(dateUTC7.getMinutes());
  const s = pad(dateUTC7.getSeconds());

  return `${d}/${m}/${y} ${h}:${min}:${s}`;
}

export default function CustomerPage() {
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  const [currentUser, setCurrentUser] = useState(null);
  const [parkingSlots, setParkingSlots] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);

  // Profile Edit States
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [profileData, setProfileData] = useState({ name: "", phone: "", email: "" });
  const [passwordData, setPasswordData] = useState({ old_password: "", new_password: "" });

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

  useEffect(() => {
    fetchUser();
    fetchParking();
  }, [fetchUser, fetchParking]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const handleDeposit = async () => {
    if (
      !depositAmount ||
      isNaN(Number(depositAmount)) ||
      Number(depositAmount) <= 0
    ) {
      toast.error("Please enter a valid amount!");
      return;
    }

    setIsDepositing(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/users/${currentUser.id}/add-balance?amount=${depositAmount}`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );
      if (!res.ok) throw new Error("Deposit failed");

      await fetchUser();
      await fetchInvoices();

      setDepositAmount("");
      setShowDeposit(false);
      toast.success("Deposit successful!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsDepositing(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/users/${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      await fetchUser();
      setShowEditProfile(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/users/${currentUser.id}/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to change password");
      }
      setShowChangePassword(false);
      setPasswordData({ old_password: "", new_password: "" });
      toast.success("Password changed successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openEditProfile = () => {
    setProfileData({ name: currentUser.name, phone: currentUser.phone, email: currentUser.email });
    setShowEditProfile(true);
  };

  if (!currentUser)
    return <p className="text-center mt-12 text-gray-500 animate-pulse">Loading dashboard...</p>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={currentUser} title="Customer Dashboard" />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <Card className="rounded-2xl shadow-sm border-t-4 border-blue-500 lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="space-y-3">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" /> My Profile
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-gray-600">
                    <p><span className="font-medium text-gray-900">Name:</span> {currentUser.name}</p>
                    <p><span className="font-medium text-gray-900">Phone:</span> {currentUser.phone}</p>
                    <p><span className="font-medium text-gray-900">Email:</span> {currentUser.email}</p>
                    <p><span className="font-medium text-gray-900">Role:</span> {currentUser.role}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <Button size="sm" variant="outline" onClick={openEditProfile} className="w-full">
                    <Edit className="w-4 h-4 mr-2" /> Edit Profile
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowChangePassword(true)} className="w-full">
                    <KeyRound className="w-4 h-4 mr-2" /> Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Balance Card */}
          <Card className="rounded-2xl shadow-sm border-t-4 border-green-500 bg-linear-to-br from-green-50 to-white">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div>
                <h2 className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-green-600" /> Available Balance
                </h2>
                <p className="text-3xl font-bold text-gray-900 mb-6">
                  {currentUser.balance?.toLocaleString()}₫
                </p>
              </div>
              <Button onClick={() => setShowDeposit(true)} className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md transition-all hover:-translate-y-0.5">
                <Plus className="w-4 h-4 mr-2" /> Top Up Balance
              </Button>
            </CardContent>
          </Card>
        </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Parking Slot Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {parkingSlots.map((slot) => (
            <Card key={slot.id} className={`rounded-xl shadow-sm border-b-4 transition-all hover:shadow-md ${slot.status === 'available' ? 'border-green-500' : 'border-red-500'}`}>
              <CardContent className="p-4 flex flex-col items-center gap-3">
                <Car className={`w-8 h-8 ${slot.status === "available" ? "text-green-500" : "text-red-500"}`} />
                <p className="font-bold text-gray-800 text-center">{slot.name}</p>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${slot.status === "available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {slot.status === "available" ? "Free" : "Occupied"}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Receipt className="w-6 h-6 text-gray-700" /> My Invoices
        </h2>
        {invoiceLoading ? (
          <p className="text-gray-500 animate-pulse">Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <Card className="rounded-2xl border-dashed">
            <CardContent className="p-12 text-center text-gray-500">
              <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No invoices yet!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
            <table className="w-full table-auto text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                <tr>
                  <th className="p-3 text-left font-medium">Invoice ID</th>
                  <th className="p-3 text-left font-medium">Start Time</th>
                  <th className="p-3 text-left font-medium">End Time</th>
                  <th className="p-3 text-center font-medium">Duration</th>
                  <th className="p-3 text-right font-medium">Total</th>
                  <th className="p-3 text-center font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-left font-mono text-xs text-gray-500">{inv.id.slice(-6)}</td>
                    <td className="p-3 text-left">{formatDateToGMT7(inv.start_time)}</td>
                    <td className="p-3 text-left text-gray-600">
                      {inv.end_time ? formatDateToGMT7(inv.end_time) : "—"}
                    </td>
                    <td className="p-3 text-center text-gray-600">
                      {inv.duration ? formatDurationFromHours(inv.duration) : "—"}
                    </td>
                    <td className="p-3 text-right font-medium text-gray-900">
                      {inv.total_price ? `${inv.total_price.toLocaleString()}₫` : "Processing"}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        inv.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-600" /> Top Up Balance
            </h2>
            <p className="text-sm text-gray-500 mb-6">Enter the amount you wish to deposit to your wallet.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount (VND)</label>
                <Input
                  type="number"
                  placeholder="e.g. 50000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full text-lg font-medium"
                  autoFocus
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {[20000, 50000, 100000].map(amt => (
                  <Button key={amt} type="button" variant="outline" size="sm" onClick={() => setDepositAmount(amt)} className="text-xs">
                    +{amt/1000}k
                  </Button>
                ))}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowDeposit(false)}>Cancel</Button>
                <Button onClick={handleDeposit} disabled={isDepositing} className="bg-green-600 hover:bg-green-700 text-white">
                  {isDepositing ? "Processing..." : "Confirm"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
