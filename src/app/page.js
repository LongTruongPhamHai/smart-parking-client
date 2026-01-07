"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";

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
        setParkingSlots(data.slice(0, 3));
      } catch (err) {
        setError("Failed to load parking lots");
      } finally {
        setLoading(false);
      }
    };

    fetchParkingLots();
  }, []);

  return (
    <main className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100 px-6 py-12">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-12"
      >
        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold text-center sm:text-left text-gray-900 tracking-tight">
            🚗 Smart Parking
          </h1>
          <p className="text-gray-600 text-lg text-center sm:text-left">
            Monitor parking lot status in real time.
          </p>
        </div>

        <div className="flex gap-3 mt-4 md:mt-0">
          <Link href="/signup">
            <Button className="bg-linear-to-r from-green-400 to-blue-500 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:scale-105 transition-transform">
              Sign Up
            </Button>
          </Link>
          <Link href="/signin">
            <Button className="bg-gray-100 text-gray-800 font-semibold px-6 py-2 rounded-full shadow hover:scale-105 hover:text-white transition-transform">
              Sign In
            </Button>
          </Link>
        </div>
      </motion.header>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-4xl mx-auto"
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Parking Lot Status
        </h2>

        {loading && (
          <p className="text-center text-gray-500 text-lg">Loading data...</p>
        )}
        {error && <p className="text-center text-red-500 text-lg">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {parkingSlots.map((slot) => {
              const isAvailable = slot.status === "available";

              return (
                <motion.div
                  key={slot.id}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                  }}
                  className="bg-white/30 backdrop-blur-md border border-gray-200 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-md transition-all duration-300"
                >
                  <div
                    className={`p-4 rounded-full ${
                      isAvailable
                        ? "bg-linear-to-tr from-green-400 to-green-600 text-white"
                        : "bg-linear-to-tr from-red-400 to-red-600 text-white"
                    }`}
                  >
                    <Car className="w-12 h-12" />
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {slot.name}
                  </div>
                  <span
                    className={`px-4 py-1 rounded-full text-sm font-semibold ${
                      isAvailable
                        ? "bg-green-500/90 text-white shadow-md"
                        : "bg-red-500/90 text-white shadow-md"
                    }`}
                  >
                    {isAvailable ? "Available" : "Occupied"}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.section>
    </main>
  );
}
