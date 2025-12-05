"use client";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion } from "framer-motion";

export default function ScrollToTopBtn() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return visible ? (
    <motion.button
      onClick={scrollToTop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-4 right-4 bg-black text-white p-2 rounded-full shadow-lg hover:bg-gray-800"
    >
      <ArrowUp className="w-5 h-5" />
    </motion.button>
  ) : null;
}
