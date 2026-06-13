"use client";

import Link from "next/link";

export function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/15 bg-[#080808]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-sm font-semibold uppercase tracking-widest text-white">
          Karaoke Suite
        </Link>
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <Link href="/setup" className="hover:text-white transition">
            Kurulum
          </Link>
          <Link href="/select" className="hover:text-white transition">
            Sarki Sec
          </Link>
          <Link href="/karaoke" className="hover:text-white transition">
            Karaoke
          </Link>
        </div>
      </div>
    </nav>
  );
}