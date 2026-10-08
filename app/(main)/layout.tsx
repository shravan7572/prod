import React from "react";
import { Navbar } from "@/components/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-6">
        {children}
      </main>
      <footer className="border-t border-zinc-900/80 py-6 text-center text-xs text-zinc-400 font-mono">
        <p>ShipIt — Daily accountability for developers who build.</p>
        <p className="mt-1 text-[11px] text-zinc-400">Resets at midnight IST · Monochrome dev edition</p>
      </footer>
    </div>
  );
}
