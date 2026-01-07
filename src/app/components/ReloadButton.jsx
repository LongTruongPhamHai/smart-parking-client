"use client";

import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

export default function ReloadButton() {
  return (
    <motion.button
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-green-400 to-blue-500 text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer z-50"
      onClick={() => window.location.reload()}
      title="Reload dữ liệu"
    >
      <RefreshCw className="w-6 h-6 animate-spin-slow" />
    </motion.button>
  );
}
