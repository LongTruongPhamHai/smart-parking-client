"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/ui/navbar";
import { toast } from "react-hot-toast";
import { Wallet, User, LogOut, BarChart3, Users, Car, X, Plus, Edit, Search } from "lucide-react";

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

export default function AdminPage() {
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  const [currentUser, setCurrentUser] = useState(null);
  const [parkingSlots, setParkingSlots] = useState([]);
  const [users, setUsers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", password: "", role: "Customer", balance: 0 });
  
  // Search
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
  }, []);

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
  }, []);

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
  }, []);

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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const toggleParkingStatus = async (slot) => {
    const newStatus = slot.status === "available" ? "occupied" : "available";
    if (
      !confirm(
        `Are you sure you want to change the status of ${slot.name} to ${newStatus}?`
      )
    )
      return;

    try {
      const res = await fetch(`${BACKEND_URL}/parking-lots/${slot.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...slot, status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success("Parking status updated");
      const data = await (await fetch(`${BACKEND_URL}/parking-lots/`)).json();
      setParkingSlots(data);
    } catch (err) {
      toast.error("Failed to update parking status");
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
      setUsers(users.filter(u => u.id !== user_id));
    } catch (err) {
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
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to create user");
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
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to update user");
      }
      toast.success("User updated successfully");
      setShowEditModal(false);
      const data = await (await fetch(`${BACKEND_URL}/users/`)).json();
      setUsers(data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openCreateModal = () => {
    setFormData({ name: "", phone: "", email: "", password: "", role: "Customer", balance: 0 });
    setShowCreateModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, phone: user.phone, email: user.email, password: "", role: user.role, balance: user.balance });
    setShowEditModal(true);
  };

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total_price, 0);
  const todayRevenue = invoices
    .filter(
      (inv) =>
        new Date(inv.start_time).toISOString().slice(0, 10) ===
        new Date().toISOString().slice(0, 10)
    )
    .reduce((sum, inv) => sum + inv.total_price, 0);

  if (!currentUser)
    return <p className="text-center mt-12 text-gray-500 animate-pulse">Loading admin dashboard...</p>;

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={currentUser} title="Admin Dashboard" />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl shadow-sm border-t-4 border-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full text-blue-600"><Users className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl shadow-sm border-t-4 border-green-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full text-green-600"><Car className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Available Slots</p>
                <p className="text-2xl font-bold">{parkingSlots.filter(s => s.status === 'available').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-t-4 border-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full text-yellow-600"><BarChart3 className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
                <p className="text-2xl font-bold">{todayRevenue.toLocaleString()}₫</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border-t-4 border-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full text-purple-600"><Wallet className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">{totalRevenue.toLocaleString()}₫</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Parking Status</h2>
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
              <Button
                size="sm"
                className={
                  slot.status === "available"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }
                onClick={() => toggleParkingStatus(slot)}
              >
                {slot.status === "available"
                  ? "Available → Occupy"
                  : "Occupied → Free"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>



      <h2 className="text-2xl font-bold mb-4">Invoices</h2>
      {invoiceLoading ? (
        <p>Loading invoices...</p>
      ) : (
        <div className="overflow-x-auto mb-8">
          <table className="w-full table-auto border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">User ID</th>
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
                  <td className="p-2 border">{inv.user_id}</td>
                  <td className="p-2 border">
                    {formatDateToGMT7(inv.start_time)}
                  </td>
                  <td className="p-2 border">
                    {inv.end_time
                      ? formatDateToGMT7(inv.end_time)
                      : "On process"}
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 mt-8">
        <h2 className="text-2xl font-bold">Users Management</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
            <Plus className="w-4 h-4 mr-1" /> Add User
          </Button>
        </div>
      </div>
      {userLoading ? (
        <p>Loading users...</p>
      ) : (
        <div className="overflow-x-auto mb-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-sm">
              <tr>
                <th className="p-3 text-left font-medium">Name & Email</th>
                <th className="p-3 text-left font-medium">Phone</th>
                <th className="p-3 text-center font-medium">Role</th>
                <th className="p-3 text-right font-medium">Balance</th>
                <th className="p-3 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-left">
                    <div className="font-medium text-gray-900">{u.name}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </td>
                  <td className="p-3 text-left text-gray-600">{u.phone}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${u.role === 'Admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-right font-medium text-green-600">{u.balance?.toLocaleString()}₫</td>
                  <td className="p-3 text-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(u)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteUser(u.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input required className="w-full border p-2 rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" required className="w-full border p-2 rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input type="password" required className="w-full border p-2 rounded" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select className="w-full border p-2 rounded" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="Customer">Customer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Balance</label>
                <input type="number" className="w-full border p-2 rounded" value={formData.balance} onChange={e => setFormData({...formData, balance: Number(e.target.value)})} />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit User</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input required className="w-full border p-2 rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" required className="w-full border p-2 rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password (Leave blank to keep)</label>
                <input type="password" className="w-full border p-2 rounded" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select className="w-full border p-2 rounded" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="Customer">Customer</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Balance</label>
                <input type="number" className="w-full border p-2 rounded" value={formData.balance} onChange={e => setFormData({...formData, balance: Number(e.target.value)})} />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button type="submit">Update</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
