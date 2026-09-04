"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/ui/navbar";
import { toast } from "react-hot-toast";
import {
  Car,
  Wallet,
  User,
  Edit,
  KeyRound,
  Plus,
  Receipt,
  Phone,
  Mail,
  ShieldCheck,
  Clock,
  Sparkles,
  X,
} from "lucide-react";

function formatDurationFromHours(hoursFloat) {
  if (!hoursFloat) return "Processing";
  const totalSeconds = Math.floor(hoursFloat * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
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

  return `${d}/${m}/${y} ${h}:${min}`;
}

export default function CustomerPage() {
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  const [currentUser, setCurrentUser] = useState(null);
  const [parkingSlots, setParkingSlots] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);

  // Profile Edit States
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
  });

  // Pagination and sorting for invoices
  const [invoicePage, setInvoicePage] = useState(1);
  const [sortOrder, setSortOrder] = useState("desc"); // desc = newest first
  const itemsPerPage = 5;

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

  // Pagination and sorting helpers
  const sortedInvoices = [...invoices].sort((a, b) => {
    const timeA = new Date(a.start_time).getTime();
    const timeB = new Date(b.start_time).getTime();
    return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
  });

  const paginate = (array, page) => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return array.slice(start, end);
  };

  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage);

  const handleSortToggle = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    setInvoicePage(1); // Reset to page 1 when sorting changes
  };

  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-200">
        <Button
          onClick={() => setInvoicePage(Math.max(1, invoicePage - 1))}
          disabled={invoicePage === 1}
          className="px-3 py-1 text-sm disabled:opacity-50"
        >
          Previous
        </Button>
        <span className="text-sm text-slate-600">
          Page {invoicePage} of {totalPages}
        </span>
        <Button
          onClick={() => setInvoicePage(Math.min(totalPages, invoicePage + 1))}
          disabled={invoicePage === totalPages}
          className="px-3 py-1 text-sm disabled:opacity-50"
        >
          Next
        </Button>
      </div>
    );
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
        { method: "POST", headers: { "Content-Type": "application/json" } },
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
      const res = await fetch(
        `${BACKEND_URL}/users/${currentUser.id}/change-password`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(passwordData),
        },
      );
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
    setProfileData({
      name: currentUser.name,
      phone: currentUser.phone,
      email: currentUser.email,
    });
    setShowEditProfile(true);
  };

  if (!currentUser)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-600 font-medium animate-pulse">
          Loading Customer Portal...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      <Navbar user={currentUser} title="Customer Dashboard" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner Welcome */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <Sparkles className="w-4 h-4" /> Welcome Back
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              {currentUser.name}
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Manage your parking reservations and digital wallet seamlessly.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-medium">
              Verified Customer Account
            </span>
          </div>
        </div>

        {/* Profile & Wallet Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <Card className="rounded-3xl border-none shadow-sm bg-white lg:col-span-2 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Personal Info
                    </h2>
                    <p className="text-xs text-slate-400">
                      Account settings and details
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={openEditProfile}
                    className="rounded-xl text-xs font-semibold"
                  >
                    <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit Profile
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowChangePassword(true)}
                    className="rounded-xl text-xs font-semibold"
                  >
                    <KeyRound className="w-3.5 h-3.5 mr-1.5" /> Password
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100">
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">
                    Full Name
                  </span>
                  <span className="font-semibold text-slate-800">
                    {currentUser.name}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100">
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">
                    Phone Number
                  </span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />{" "}
                    {currentUser.phone}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100">
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">
                    Email Address
                  </span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />{" "}
                    {currentUser.email}
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100">
                  <span className="text-xs font-medium text-slate-400 block mb-0.5">
                    Role
                  </span>
                  <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Balance Card */}
          <Card className="rounded-3xl border-none shadow-sm bg-gradient-to-br from-emerald-500 to-teal-700 text-white overflow-hidden flex flex-col justify-between">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                    <Wallet className="w-6 h-6 text-emerald-100" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-emerald-100">
                    Smart Wallet
                  </span>
                </div>
                <p className="text-xs font-medium text-emerald-100">
                  Available Balance
                </p>
                <p className="text-4xl font-black mt-1">
                  {currentUser.balance?.toLocaleString()}₫
                </p>
              </div>

              <Button
                onClick={() => setShowDeposit(true)}
                className="w-full mt-6 bg-white text-emerald-800 hover:bg-emerald-50 font-bold rounded-2xl shadow-lg transition-all"
              >
                <Plus className="w-4 h-4 mr-2" /> Top Up Wallet
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Parking Slots Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-600" /> Parking Lot Status
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Current availability
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {parkingSlots.map((slot) => {
              const isAvailable = slot.status === "available";
              return (
                <Card
                  key={slot.id}
                  className={`rounded-2xl border-2 transition-all hover:shadow-md ${
                    isAvailable
                      ? "border-emerald-200 bg-emerald-50/30"
                      : "border-rose-200 bg-rose-50/30"
                  }`}
                >
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div
                      className={`p-3 rounded-full ${isAvailable ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}
                    >
                      <Car className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-800 text-sm">
                      {slot.name}
                    </p>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isAvailable
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {isAvailable ? "Available" : "Occupied"}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* My Invoices Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-slate-700" /> My Parking History
          </h2>

          {invoiceLoading ? (
            <p className="text-slate-500 animate-pulse text-sm">
              Loading invoices...
            </p>
          ) : invoices.length === 0 ? (
            <Card className="rounded-3xl border-dashed border-2 border-slate-200 bg-white">
              <CardContent className="p-12 text-center text-slate-400">
                <Receipt className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-medium text-sm">
                  No parking invoices recorded yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <span className="text-sm text-slate-600">
                  {sortedInvoices.length} invoice
                  {sortedInvoices.length !== 1 ? "s" : ""}
                </span>
                <Button
                  onClick={handleSortToggle}
                  className="px-3 py-1 text-sm"
                  variant="ghost"
                >
                  Sort: {sortOrder === "desc" ? "Newest First" : "Oldest First"}
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 font-semibold uppercase text-xs">
                    <tr>
                      <th className="p-4">Invoice ID</th>
                      <th className="p-4">Check-in</th>
                      <th className="p-4">Check-out</th>
                      <th className="p-4 text-center">Duration</th>
                      <th className="p-4 text-right">Total Price</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginate(sortedInvoices, invoicePage).map((inv) => (
                      <tr
                        key={inv.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="p-4 font-bold text-slate-900">
                          #{inv.id.slice(-6)}
                        </td>
                        <td className="p-4 text-slate-600">
                          {formatDateToGMT7(inv.start_time)}
                        </td>
                        <td className="p-4 text-slate-600">
                          {inv.end_time
                            ? formatDateToGMT7(inv.end_time)
                            : "Parked"}
                        </td>
                        <td className="p-4 text-center text-slate-600">
                          {inv.duration
                            ? formatDurationFromHours(inv.duration)
                            : "—"}
                        </td>
                        <td className="p-4 text-right font-bold text-slate-900">
                          {inv.total_price
                            ? `${inv.total_price.toLocaleString()}₫`
                            : "Calculating"}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2.5 py-1 text-xs rounded-full font-semibold ${
                              inv.status === "completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <PaginationControls />
              </div>
            </Card>
          )}
        </div>

        {/* Deposit Modal */}
        {showDeposit && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-150">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <Wallet className="w-5 h-5 text-emerald-600" /> Top Up Wallet
                </h2>
                <button
                  onClick={() => setShowDeposit(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                    Enter Amount (VND)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 50000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full text-lg font-bold rounded-xl"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[20000, 50000, 100000, 200000].map((amt) => (
                    <Button
                      key={amt}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDepositAmount(amt)}
                      className="text-xs font-semibold rounded-xl border-slate-200 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      +{amt / 1000}k
                    </Button>
                  ))}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setShowDeposit(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeposit}
                    disabled={isDepositing}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                  >
                    {isDepositing ? "Processing..." : "Confirm Top Up"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-150">
              <h2 className="text-lg font-bold mb-4 text-slate-800">
                Edit Profile
              </h2>
              <form onSubmit={handleUpdateProfile} className="space-y-3">
                <input
                  required
                  placeholder="Name"
                  className="w-full border rounded-xl p-2.5 text-sm"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                />
                <input
                  required
                  placeholder="Phone"
                  className="w-full border rounded-xl p-2.5 text-sm"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                />
                <input
                  type="email"
                  required
                  placeholder="Email"
                  className="w-full border rounded-xl p-2.5 text-sm"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                />
                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setShowEditProfile(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl bg-blue-600 text-white"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showChangePassword && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-150">
              <h2 className="text-lg font-bold mb-4 text-slate-800">
                Change Password
              </h2>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <input
                  type="password"
                  required
                  placeholder="Old Password"
                  className="w-full border rounded-xl p-2.5 text-sm"
                  value={passwordData.old_password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      old_password: e.target.value,
                    })
                  }
                />
                <input
                  type="password"
                  required
                  placeholder="New Password"
                  className="w-full border rounded-xl p-2.5 text-sm"
                  value={passwordData.new_password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      new_password: e.target.value,
                    })
                  }
                />
                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setShowChangePassword(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl bg-blue-600 text-white"
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
