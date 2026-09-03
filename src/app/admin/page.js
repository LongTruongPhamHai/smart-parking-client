"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/ui/navbar";
import { toast } from "react-hot-toast";
import {
  Wallet,
  Users,
  Car,
  X,
  Plus,
  Edit,
  Search,
  TrendingUp,
  FileText,
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

export default function AdminPage() {
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  const [currentUser, setCurrentUser] = useState(null);
  const [parkingSlots, setParkingSlots] = useState([]);
  const [users, setUsers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  const [userLoading, setUserLoading] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    role: "Customer",
    balance: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const { id } = JSON.parse(storedUser);

    const fetchUser = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/users/by-id/${id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCurrentUser(data);
      } catch {
        localStorage.removeItem("user");
      }
    };
    fetchUser();
  }, [BACKEND_URL]);

  useEffect(() => {
    const fetchParking = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/parking-lots/`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setParkingSlots(data);
      } catch (err) {
        console.error("Failed to load parking slots", err);
      }
    };
    fetchParking();
  }, [BACKEND_URL]);

  useEffect(() => {
    const fetchUsers = async () => {
      setUserLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/users/`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users list", err);
      } finally {
        setUserLoading(false);
      }
    };
    fetchUsers();
  }, [BACKEND_URL]);

  useEffect(() => {
    const fetchInvoices = async () => {
      setInvoiceLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/invoices/`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setInvoices(data);
      } catch (err) {
        console.error("Failed to load invoices", err);
      } finally {
        setInvoiceLoading(false);
      }
    };
    fetchInvoices();
  }, [BACKEND_URL]);

  const toggleParkingStatus = async (slot) => {
    const newStatus = slot.status === "available" ? "occupied" : "available";
    try {
      const res = await fetch(`${BACKEND_URL}/parking-lots/${slot.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...slot, status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(
        `Slot ${slot.name} updated to ${newStatus === "available" ? "Available" : "Occupied"}`,
      );
      const data = await (await fetch(`${BACKEND_URL}/parking-lots/`)).json();
      setParkingSlots(data);
    } catch {
      toast.error("Failed to update slot status");
    }
  };

  const deleteUser = async (user_id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/users/${user_id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("User deleted successfully");
      setUsers(users.filter((u) => u.id !== user_id));
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/users/admin-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to create user");
      }
      toast.success("User created successfully");
      setShowCreateModal(false);
      const data = await (await fetch(`${BACKEND_URL}/users/`)).json();
      setUsers(data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const { password, ...updateData } = formData;
      const res = await fetch(`${BACKEND_URL}/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(password ? formData : updateData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to update user");
      }
      toast.success("User updated successfully");
      setShowEditModal(false);
      const data = await (await fetch(`${BACKEND_URL}/users/`)).json();
      setUsers(data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const totalRevenue = invoices.reduce(
    (sum, inv) => sum + (inv.total_price || 0),
    0,
  );
  const today = new Date();

  const todayRevenue = invoices
    .filter((inv) => {
      if (!inv.start_time) return false;
      const invDate = new Date(inv.start_time);

      return (
        invDate.getDate() === today.getDate() &&
        invDate.getMonth() === today.getMonth() &&
        invDate.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, inv) => sum + (inv.total_price || 0), 0);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!currentUser)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-600 font-medium animate-pulse">
          Loading Admin Dashboard...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      <Navbar user={currentUser} title="Admin" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-xl">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Smart Parking Management Portal
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Welcome back, {currentUser?.name}. Manage your operations
              efficiently.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>{" "}
              Live System
            </span>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="rounded-2xl border-none shadow-sm bg-white hover:shadow-md transition-all">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Users
                </p>
                <p className="text-3xl font-black text-slate-800 mt-1">
                  {users.length}
                </p>
              </div>
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
                <Users className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm bg-white hover:shadow-md transition-all">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Available Slots
                </p>
                <p className="text-3xl font-black text-emerald-600 mt-1">
                  {parkingSlots.filter((s) => s.status === "available").length}/
                  {parkingSlots.length}
                </p>
              </div>
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Car className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm bg-white hover:shadow-md transition-all">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Today's Revenue
                </p>
                <p className="text-2xl font-black text-amber-600 mt-1">
                  {todayRevenue.toLocaleString()}₫
                </p>
              </div>
              <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
                <TrendingUp className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none shadow-sm bg-white hover:shadow-md transition-all">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Revenue
                </p>
                <p className="text-2xl font-black text-purple-600 mt-1">
                  {totalRevenue.toLocaleString()}₫
                </p>
              </div>
              <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl">
                <Wallet className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 space-x-8 overflow-x-auto">
          {[
            { id: "overview", label: "Parking Overview", icon: Car },
            { id: "invoices", label: "Invoice History", icon: FileText },
            { id: "users", label: "User Management", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 font-semibold text-sm transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Parking Slots */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {parkingSlots.map((slot) => {
                const isAvailable = slot.status === "available";
                return (
                  <Card
                    key={slot.id}
                    className={`rounded-2xl border-2 transition-all ${
                      isAvailable
                        ? "border-emerald-200 bg-emerald-50/30"
                        : "border-rose-200 bg-rose-50/30"
                    }`}
                  >
                    <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                      <div
                        className={`p-4 rounded-full ${isAvailable ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}
                      >
                        <Car className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">
                          {slot.name}
                        </h3>
                        <span
                          className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mt-1 ${isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                        >
                          {isAvailable ? "● Available" : "● Occupied"}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className={`w-full rounded-xl font-medium shadow-sm transition-all ${
                          isAvailable
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-rose-600 hover:bg-rose-700 text-white"
                        }`}
                        onClick={() => toggleParkingStatus(slot)}
                      >
                        {isAvailable ? "Set Occupied" : "Free Slot"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Invoices */}
        {activeTab === "invoices" && (
          <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-white">
            {invoiceLoading ? (
              <div className="p-8 text-center text-slate-500">
                Loading invoice history...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                    <tr>
                      <th className="p-4">Invoice ID</th>
                      <th className="p-4">User ID</th>
                      <th className="p-4">Check-in</th>
                      <th className="p-4">Check-out</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4 text-right">Total Price</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((inv) => (
                      <tr
                        key={inv.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="p-4 font-bold text-slate-900">
                          #{inv.id}
                        </td>
                        <td className="p-4 font-medium">{inv.user_id}</td>
                        <td className="p-4 text-slate-500">
                          {formatDateToGMT7(inv.start_time)}
                        </td>
                        <td className="p-4 text-slate-500">
                          {inv.end_time
                            ? formatDateToGMT7(inv.end_time)
                            : "Active"}
                        </td>
                        <td className="p-4 text-slate-500">
                          {inv.duration
                            ? formatDurationFromHours(inv.duration)
                            : "—"}
                        </td>
                        <td className="p-4 text-right font-bold text-slate-900">
                          {inv.total_price
                            ? `${inv.total_price.toLocaleString()}₫`
                            : "—"}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${inv.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                          >
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Tab 3: Users Management */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                onClick={() => {
                  setFormData({
                    name: "",
                    phone: "",
                    email: "",
                    password: "",
                    role: "Customer",
                    balance: 0,
                  });
                  setShowCreateModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" /> Add New User
              </Button>
            </div>

            <Card className="rounded-2xl border-none shadow-sm overflow-hidden bg-white">
              {userLoading ? (
                <div className="p-8 text-center text-slate-500">
                  Loading user accounts...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                      <tr>
                        <th className="p-4">User Info</th>
                        <th className="p-4">Phone</th>
                        <th className="p-4 text-center">Role</th>
                        <th className="p-4 text-right">Balance</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((u) => (
                        <tr
                          key={u.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="p-4">
                            <div className="font-semibold text-slate-900">
                              {u.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {u.email}
                            </div>
                          </td>
                          <td className="p-4 text-slate-600">{u.phone}</td>
                          <td className="p-4 text-center">
                            <span
                              className={`px-2.5 py-1 text-xs rounded-full font-semibold ${u.role === "Admin" ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"}`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4 text-right font-bold text-emerald-600">
                            {u.balance?.toLocaleString()}₫
                          </td>
                          <td className="p-4 text-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="rounded-lg hover:bg-slate-100"
                              onClick={() => {
                                setEditingUser(u);
                                setFormData({
                                  name: u.name,
                                  phone: u.phone,
                                  email: u.email,
                                  password: "",
                                  role: u.role,
                                  balance: u.balance,
                                });
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="w-4 h-4 text-slate-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="rounded-lg hover:bg-rose-50 text-rose-600"
                              onClick={() => deleteUser(u.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Modal: Create User */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-150">
              <h2 className="text-xl font-bold mb-4 text-slate-800">
                Create New User
              </h2>
              <form onSubmit={handleCreateUser} className="space-y-3">
                <input
                  required
                  placeholder="Full Name"
                  className="w-full border rounded-xl p-2.5 text-sm"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <input
                  required
                  placeholder="Phone Number"
                  className="w-full border rounded-xl p-2.5 text-sm"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  className="w-full border rounded-xl p-2.5 text-sm"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  className="w-full border rounded-xl p-2.5 text-sm"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <select
                  className="w-full border rounded-xl p-2.5 text-sm"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="Customer">Customer</option>
                  <option value="Admin">Admin</option>
                </select>
                <input
                  type="number"
                  placeholder="Initial Balance"
                  className="w-full border rounded-xl p-2.5 text-sm"
                  value={formData.balance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      balance: Number(e.target.value),
                    })
                  }
                />
                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl bg-blue-600 text-white"
                  >
                    Create Account
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit User */}
        {showEditModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-150">
              <h2 className="text-xl font-bold mb-4 text-slate-800">
                Edit User Profile
              </h2>
              <form onSubmit={handleUpdateUser} className="space-y-3">
                <input
                  required
                  placeholder="Full Name"
                  className="w-full border rounded-xl p-2.5 text-sm"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <input
                  required
                  placeholder="Phone Number"
                  className="w-full border rounded-xl p-2.5 text-sm"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  className="w-full border rounded-xl p-2.5 text-sm"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <input
                  type="password"
                  placeholder="New Password (Leave blank to keep unchanged)"
                  className="w-full border rounded-xl p-2.5 text-sm"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <select
                  className="w-full border rounded-xl p-2.5 text-sm"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="Customer">Customer</option>
                  <option value="Admin">Admin</option>
                </select>
                <input
                  type="number"
                  placeholder="Balance"
                  className="w-full border rounded-xl p-2.5 text-sm"
                  value={formData.balance}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      balance: Number(e.target.value),
                    })
                  }
                />
                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => setShowEditModal(false)}
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
      </main>
    </div>
  );
}
