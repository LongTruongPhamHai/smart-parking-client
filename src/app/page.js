"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <main className="flex flex-col items-center justify-center min-h-full bg-white text-black px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl text-center space-y-6"
      >
        <h1 className="text-3xl font-bold">Hệ thống Bãi đỗ xe thông minh</h1>
        <p className="text-gray-700 leading-relaxed">
          Hệ thống bãi đỗ xe thông minh giúp người dùng dễ dàng tìm kiếm, đặt
          chỗ và quản lý phương tiện của mình. Với công nghệ hiện đại, hệ thống
          mang lại trải nghiệm tiện lợi, tiết kiệm thời gian và tối ưu hóa không
          gian đỗ xe trong đô thị.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/signup">
            <Button
              variant="default"
              className="bg-black text-white hover:bg-gray-800"
            >
              Đăng ký
            </Button>
          </Link>
          <Link href="/signin">
            <Button
              variant="outline"
              className="border-black text-black hover:bg-gray-100"
            >
              Đăng nhập
            </Button>
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
