"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Car,
  Cpu,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Activity,
} from "lucide-react";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export default function Page() {
  const [parkingSlots, setParkingSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParkingLots = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/parking-lots/`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setParkingSlots(data);
      } catch (err) {
        setError("Failed to load real-time parking status");
      } finally {
        setLoading(false);
      }
    };

    fetchParkingLots();
  }, []);

  const totalSlots = parkingSlots.length;
  const availableSlots = parkingSlots.filter(
    (s) => s.status === "available",
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden font-sans">
      {/* Light Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        {/* Navigation & Hero Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm"
        >
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-600 text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" /> Next-Gen IoT Parking
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-3">
              <Car className="w-9 h-9 text-blue-600 shrink-0" />
              Smart Parking
            </h1>
            <p className="text-slate-500 text-sm max-w-md">
              Real-time parking lot occupancy monitoring powered by automated
              barrier control.
            </p>
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/simulator">
              <Button
                variant="outline"
                className="h-11 px-5 rounded-xl border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                <Cpu className="w-4 h-4 text-purple-600" />
                Simulator
              </Button>
            </Link>
            <Link href="/signin">
              <Button
                variant="outline"
                className="h-11 px-5 rounded-xl border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 transition-all"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2">
                Sign Up <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.header>

        {/* Live Overview Stats */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Total Capacity
                </span>
                <p className="text-2xl font-black text-slate-800 mt-0.5">
                  {totalSlots} Slots
                </p>
              </div>
              <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
                <Car className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Available
                </span>
                <p className="text-2xl font-black text-emerald-600 mt-0.5">
                  {availableSlots} Free
                </p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Occupied
                </span>
                <p className="text-2xl font-black text-rose-600 mt-0.5">
                  {totalSlots - availableSlots} Busy
                </p>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Live Slots Grid Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Live Slot Status
            </h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />{" "}
              Live Sync
            </span>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 font-medium text-sm animate-pulse">
                Connecting to IoT sensors...
              </p>
            </div>
          )}

          {error && (
            <div className="p-6 text-center bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-sm font-semibold">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {parkingSlots.map((slot) => {
                const isAvailable = slot.status === "available";

                return (
                  <motion.div
                    key={slot.id}
                    whileHover={{ y: -4 }}
                    className={`rounded-3xl p-6 flex flex-col items-center text-center gap-4 border-2 transition-all shadow-sm ${
                      isAvailable
                        ? "bg-white border-emerald-200/80 hover:border-emerald-400 hover:shadow-emerald-100"
                        : "bg-white border-rose-200/80 hover:border-rose-400 hover:shadow-rose-100"
                    }`}
                  >
                    <div
                      className={`p-4 rounded-2xl ${
                        isAvailable
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-rose-100 text-rose-600"
                      }`}
                    >
                      <Car className="w-10 h-10" />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-800">
                        {slot.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Slot ID: #{slot.id}
                      </p>
                    </div>

                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isAvailable
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {isAvailable ? "● Available" : "● Occupied"}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.section>
      </div>
    </main>
  );
}
