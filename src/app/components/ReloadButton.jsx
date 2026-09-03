"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw } from "lucide-react";

export default function ReloadButton() {
  const [isHovered, setIsHovered] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const handleReload = () => {
    setIsRotating(true);
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Smart Floating Reload Button */}
      <motion.button
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.08, y: -2 }}
        whileTap={{ scale: 0.92 }}
        onClick={handleReload}
        className="relative group flex items-center gap-2.5 px-4 h-13 bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-xl shadow-slate-950/20 cursor-pointer overflow-hidden transition-all duration-300"
        title="Reload Data"
      >
        {/* Glow ambient background effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-2xl blur-sm opacity-0 group-hover:opacity-40 transition-opacity duration-500 -z-10" />

        {/* Refresh Icon with Rotation Effect */}
        <motion.div
          animate={{ rotate: isRotating ? 360 : isHovered ? 180 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="text-blue-400 group-hover:text-emerald-400 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </motion.div>

        {/* Expandable Tooltip Text */}
        <AnimatePresence>
          {isHovered && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs font-semibold tracking-wide whitespace-nowrap text-slate-200 overflow-hidden"
            >
              Refresh Data
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
