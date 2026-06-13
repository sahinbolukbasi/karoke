"use client";

import { KaraokeProvider } from "@/components/KaraokeContext";
import { NavBar } from "@/components/NavBar";

export function ProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <KaraokeProvider>
      <NavBar />
      <main className="flex-1 pt-12">{children}</main>
    </KaraokeProvider>
  );
}