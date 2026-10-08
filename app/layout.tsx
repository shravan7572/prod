import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "ShipIt — What Did You Ship Today?",
  description:
    "Daily accountability for developers who build. Share your daily ship, track your streak, and discover builders.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
