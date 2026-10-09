import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 bg-grid-pattern relative selection:bg-zinc-800 selection:text-white">
      {/* Subtle top ambient light (pure monochrome gray, zero color/purple) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-32 bg-zinc-800/20 blur-[100px] pointer-events-none -z-10" />

      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-7 relative z-10">
        {children}
      </main>

      <Footer />
    </div>
  );
}
