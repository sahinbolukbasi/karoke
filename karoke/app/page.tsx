"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <p className="text-xs uppercase tracking-[0.35em] text-zinc-400">Karaoke Suite</p>
        <h1 className="mt-3 text-5xl font-light tracking-tight text-white md:text-7xl">
          Monochrome
          <span className="block text-2xl font-semibold md:text-4xl">Stage</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-zinc-400">
          Sade bir arayuz, guclu baglantilar. Spotifyni bagla, mikrofonu ac ve
          tam ekran karaoke deneyimine basla.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/setup"
            className="rounded-xl border border-white/30 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
          >
            Kuruluma Basla
          </Link>
          <Link
            href="/select"
            className="rounded-xl border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Direkt Sarki Sec
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="mt-16 grid gap-3 text-center text-xs text-zinc-500 md:grid-cols-3"
      >
        <div className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">
          <p className="font-semibold text-zinc-300">Spotify</p>
          <p className="mt-1">Giris yap, sarki ara, oynat</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">
          <p className="font-semibold text-zinc-300">Bluetooth + Mikrofon</p>
          <p className="mt-1">Hoparlor ve mikrofon baglantisi</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">
          <p className="font-semibold text-zinc-300">Tam Ekran Karaoke</p>
          <p className="mt-1">Akan sozler, anlik puanlama</p>
        </div>
      </motion.div>
    </div>
  );
}
