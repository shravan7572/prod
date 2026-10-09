import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f6f8f6] text-[#18181b] selection:bg-[#eb5e52]/15 selection:text-[#eb5e52]">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-6">
        {children}
      </main>

      <Footer />
    </div>
  );
}
