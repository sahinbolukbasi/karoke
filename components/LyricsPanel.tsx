"use client";

import { LyricLine } from "@/types/karaoke";
import { motion } from "framer-motion";

interface LyricsPanelProps {
  lines: LyricLine[];
  activeIndex: number;
  elapsedSeconds: number;
}

export function LyricsPanel({ lines, activeIndex, elapsedSeconds }: LyricsPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16 }}
      className="rounded-3xl border border-white/30 bg-white/15 p-5 shadow-2xl backdrop-blur-xl"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-wide text-white">Karaoke Lyrics</h2>
        <span className="rounded-full bg-black/35 px-3 py-1 text-xs font-semibold text-cyan-100">
          {elapsedSeconds.toFixed(1)} sn
        </span>
      </div>

      <div className="mt-4 max-h-72 space-y-2 overflow-auto pr-2">
        {lines.length === 0 && <p className="text-sm text-white/70">Sarki secildiginde sozler burada akar.</p>}
        {lines.map((line, index) => {
          const isActive = index === activeIndex;
          return (
            <motion.p
              key={line.id}
              animate={{
                scale: isActive ? 1.02 : 1,
                opacity: isActive ? 1 : 0.65,
              }}
              className={`rounded-xl px-3 py-2 text-base md:text-lg ${
                isActive
                  ? "bg-gradient-to-r from-fuchsia-400/65 via-cyan-300/65 to-amber-200/65 font-semibold text-black"
                  : "bg-black/20 text-white"
              }`}
            >
              {line.text}
            </motion.p>
          );
        })}
      </div>
    </motion.section>
  );
}
