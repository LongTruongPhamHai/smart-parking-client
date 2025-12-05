"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import SideMenu from "./SideMenu";
import ScrollToTopBtn from "./ScrollToTopBtn";
import { useState } from "react";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const hiddenLayoutPaths = ["/signin", "/signup"];

  const shouldHideLayout = hiddenLayoutPaths.includes(pathname);

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      {!shouldHideLayout && <Header onToggleMenu={() => setMenuOpen(true)} />}
      <div className="flex flex-1">
        {!shouldHideLayout && (
          <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        )}
        <main className="flex-1 p-4 bg-gray-50">{children}</main>
      </div>
      <Footer />
      {!shouldHideLayout && <ScrollToTopBtn />}
    </div>
  );
}
