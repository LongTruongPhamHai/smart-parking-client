import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReloadButton from "./components/ReloadButton";
import { ToastProvider } from "@/components/providers/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Smart Parking System",
  description:
    "Monitor and manage smart parking slots with IoT integration (Simulator)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans selection:bg-blue-500 selection:text-white`}
      >
        {children}
        <ToastProvider />
        <ReloadButton />
      </body>
    </html>
  );
}
