"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useKaraokeContext } from "@/components/KaraokeContext";
import { buildDemoLyrics, getActiveLyricIndex } from "@/lib/lyrics";
import { startSpotifyPlayback } from "@/lib/spotify";
import { PerformanceScore } from "@/types/karaoke";

export default function KaraokeFullscreenPage() {
  const {
    currentSinger,
    selectedTrack,
    spotifyToken,
    spotifyDeviceId,
    isAnalyzing,
    startAnalysis,
    stopAnalysis,
    scorePerformance,
    setIsRunning,
    setElapsedMs,
    setTelemetry,
    setScore,
    rotateQueue,
  } = useKaraokeContext();

  const [phase, setPhase] = useState<"ready" | "running" | "scoring" | "done">("ready");
  const [elapsed, setElapsed] = useState(0);
  const [scoreResult, setScoreResult] = useState<PerformanceScore | undefined>();

  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const phaseRef = useRef(phase);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const lyrics = useMemo(() => buildDemoLyrics(selectedTrack), [selectedTrack]);
  const activeIndex = useMemo(() => getActiveLyricIndex(lyrics, elapsed), [lyrics, elapsed]);

  const stopSession = useCallback(async () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setPhase("scoring");
    setIsRunning(false);

    const telemetry = await stopAnalysis();
    const score = scorePerformance(telemetry);

    setScoreResult(score);
    setTelemetry(telemetry);
    setScore(score);

    setTimeout(() => {
      setPhase("done");
    }, 2000);
  }, [stopAnalysis, scorePerformance, setIsRunning, setTelemetry, setScore]);

  const startSession = useCallback(async () => {
    if (!currentSinger || !selectedTrack) return;

    setPhase("running");
    setIsRunning(true);
    setElapsed(0);
    setElapsedMs(0);
    setScoreResult(undefined);

    await startAnalysis();

    startedAtRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      const diff = Date.now() - startedAtRef.current;
      setElapsed(diff);
      setElapsedMs(diff);
    }, 100);

    try {
      if (spotifyToken && spotifyDeviceId) {
        await startSpotifyPlayback(spotifyToken, selectedTrack.uri, spotifyDeviceId);
      }
    } catch {
      // playback optional
    }

    setTimeout(() => {
      if (phaseRef.current === "running") {
        stopSession();
      }
    }, 180000);
  }, [currentSinger, selectedTrack, spotifyToken, spotifyDeviceId, startAnalysis, stopSession, setIsRunning, setElapsedMs]);

  const nextRound = useCallback(() => {
    rotateQueue();
    setPhase("ready");
    setElapsed(0);
    setScoreResult(undefined);
  }, [rotateQueue]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (!currentSinger || !selectedTrack) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <p className="text-2xl text-zinc-400">Sarki ve sarkici secilmedi.</p>
        <a
          href="/select"
          className="mt-6 rounded-xl border border-white/30 bg-white px-6 py-3 text-sm font-semibold text-black"
        >
          Secim Sayfasina Git
        </a>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[#0a0a10] via-[#050508] to-[#0a0a10] text-white">
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-6 py-3 text-xs backdrop-blur-sm"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[10px] font-bold">
              {currentSinger.name[0]}
            </div>
            <span className="font-medium text-zinc-300">{currentSinger.name}</span>
          </div>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-500">{selectedTrack.name} — {selectedTrack.artist}</span>
        </div>
        <div className="flex items-center gap-4">
          {phase === "running" && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-zinc-300 backdrop-blur-sm"
            >
              {(elapsed / 1000).toFixed(1)}s
            </motion.span>
          )}
          <button
            onClick={() => {
              if (phase === "running") stopSession();
              else if (phase === "ready") startSession();
            }}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/30"
          >
            {phase === "running" ? "Bitir" : phase === "scoring" ? "..." : "Başlat"}
          </button>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex flex-1 items-center justify-center px-6 md:px-16">
        <div className="w-full max-w-4xl text-center">
          <AnimatePresence mode="wait">
            {phase === "ready" && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="mb-8"
                >
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 backdrop-blur-sm border border-white/10">
                    <svg className="h-10 w-10 text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                </motion.div>
                <p className="text-3xl font-light text-white md:text-4xl">
                  Hazır mısın{" "}
                  <span className="font-semibold text-gradient">{currentSinger.name}</span>?
                </p>
                <p className="mt-3 text-sm text-zinc-500">{selectedTrack.name} — {selectedTrack.artist}</p>
                <button
                  onClick={startSession}
                  className="mt-8 rounded-2xl bg-white px-10 py-4 text-base font-semibold text-black transition-all hover:scale-105 hover:shadow-2xl hover:shadow-white/20"
                >
                  Başlat
                </button>
              </motion.div>
            )}

            {phase === "running" && (
              <motion.div
                key="lyrics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Progress bar */}
                <div className="mx-auto mb-8 h-1 max-w-md overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                    animate={{ width: `${Math.min((elapsed / 180000) * 100, 100)}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>

                {lyrics.map((line, i) => {
                  const isActive = i === activeIndex;
                  const isPast = i < activeIndex;
                  return (
                    <motion.p
                      key={line.id}
                      animate={{
                        opacity: isActive ? 1 : isPast ? 0.3 : 0.15,
                        scale: isActive ? 1.06 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      className={`text-2xl font-light transition-all md:text-4xl lg:text-5xl ${
                        isActive
                          ? "text-gradient font-semibold"
                          : isPast
                            ? "text-zinc-500 line-through decoration-zinc-700"
                            : "text-zinc-600"
                      }`}
                    >
                      {line.text}
                    </motion.p>
                  );
                })}
              </motion.div>
            )}

            {(phase === "scoring" || phase === "done") && scoreResult && (
              <motion.div
                key="score"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* Score circle */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 backdrop-blur-sm border-2 border-white/20"
                >
                  <div>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-5xl font-bold text-gradient"
                    >
                      {scoreResult.total}
                    </motion.p>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500">Puan</p>
                  </div>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-xl font-medium text-white md:text-2xl"
                >
                  {scoreResult.message}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mx-auto max-w-xs space-y-2 rounded-2xl border border-white/10 bg-white/5 p-5 text-left backdrop-blur-sm"
                >
                  {[
                    { label: "Ritim", value: scoreResult.breakdown.rhythm },
                    { label: "Enerji", value: scoreResult.breakdown.energy },
                    { label: "Ton Dengesi", value: scoreResult.breakdown.pitchStability },
                    { label: "Bonus", value: scoreResult.breakdown.crowdBonus },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">{item.label}</span>
                      <span className="font-medium text-white">{item.value}</span>
                    </div>
                  ))}
                </motion.div>

                {phase !== "scoring" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <button
                      onClick={nextRound}
                      className="rounded-2xl bg-white px-10 py-4 text-base font-semibold text-black transition-all hover:scale-105 hover:shadow-2xl hover:shadow-white/20"
                    >
                      Sonraki Şarkıcı
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-6 py-3 text-xs text-zinc-600">
        <span className="rounded-full border border-white/10 px-3 py-1">F — Tam ekran</span>
        <span className="flex items-center gap-2">
          <span className={`relative flex h-2 w-2 ${isAnalyzing ? "" : "opacity-50"}`}>
            {isAnalyzing && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            )}
            <span className={`relative inline-flex h-2 w-2 rounded-full ${isAnalyzing ? "bg-emerald-400" : "bg-zinc-600"}`} />
          </span>
          Mikrofon: {isAnalyzing ? "Aktif" : "Beklemede"}
        </span>
      </div>
    </div>
  );
}