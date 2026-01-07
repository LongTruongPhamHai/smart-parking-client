"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, User, LogOut, BarChart3, Users, Car, X } from "lucide-react";

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
      window.location.reload();
    } catch (err) {
      alert("Failed to update parking status");
    }
  };

  const deleteUser = async (user_id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/users/${user_id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      window.location.reload();
    } catch (err) {
      alert("Failed to delete user");
    }
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
    return <p className="text-center mt-12">Loading admin information...</p>;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-1" /> Logout
        </Button>
      </div>

      <Card className="mb-8 rounded-2xl shadow-md">
        <CardContent className="space-y-2">
          <h2 className="text-xl font-bold">Admin Information</h2>
          <p>
            <User className="inline w-4 h-4 mr-1" /> {currentUser.name}
          </p>
          <p>Email: {currentUser.email}</p>
          <p>Phone: {currentUser.phone}</p>
          <p>Role: {currentUser.role}</p>
          <p>Balance: {currentUser.balance?.toLocaleString()}₫</p>
        </CardContent>
      </Card>

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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Card className="rounded-2xl shadow-md">
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" /> Total Revenue
            </div>
            <p className="text-3xl font-bold text-green-600">
              {totalRevenue.toLocaleString()}₫
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-md">
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" /> Today's Revenue
            </div>
            <p className="text-3xl font-bold text-blue-600">
              {todayRevenue.toLocaleString()}₫
            </p>
          </CardContent>
        </Card>
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

      <h2 className="text-2xl font-bold mb-4">Users List</h2>
      {userLoading ? (
        <p>Loading users...</p>
      ) : (
        <div className="overflow-x-auto mb-8">
          <table className="w-full table-auto border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border">Role</th>
                <th className="p-2 border">Balance</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="text-center border-t">
                  <td className="p-2 border">{u.id}</td>
                  <td className="p-2 border">{u.name}</td>
                  <td className="p-2 border">{u.email}</td>
                  <td className="p-2 border">{u.phone}</td>
                  <td className="p-2 border">{u.role}</td>
                  <td className="p-2 border">{u.balance?.toLocaleString()}₫</td>
                  <td className="p-2 border">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteUser(u.id)}
                    >
                      <X className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
