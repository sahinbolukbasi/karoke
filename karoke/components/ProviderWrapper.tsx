"use client";

import { KaraokeProvider } from "@/components/KaraokeContext";
import { NavBar } from "@/components/NavBar";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, filter: "blur(4px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(4px)" }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function ProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <KaraokeProvider>
      <div className="bg-mesh" />
      <NavBar />
      <PageTransition>
        <main className="flex-1 pt-16">{children}</main>
      </PageTransition>
    </KaraokeProvider>
  );
}