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
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white">
      <div className="flex items-center justify-between px-6 py-3 text-xs text-zinc-500">
        <div className="flex gap-6">
          <span>{currentSinger.name}</span>
          <span>{selectedTrack.name} - {selectedTrack.artist}</span>
        </div>
        <div className="flex items-center gap-4">
          {phase === "running" && (
            <span className="text-zinc-400">{(elapsed / 1000).toFixed(1)} sn</span>
          )}
          <button
            onClick={() => {
              if (phase === "running") stopSession();
              else if (phase === "ready") startSession();
            }}
            className="rounded-lg border border-white/25 bg-zinc-900 px-3 py-1 text-xs hover:bg-zinc-700"
          >
            {phase === "running" ? "Bitir" : phase === "scoring" ? "..." : "Baslat"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 md:px-12">
        <div className="max-w-4xl text-center">
          <AnimatePresence mode="wait">
            {phase === "ready" && (
              <motion.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-2xl text-zinc-500 md:text-4xl">Hazir misin?</p>
                <button
                  onClick={startSession}
                  className="mt-6 rounded-xl border border-white/30 bg-white px-8 py-3 text-base font-semibold text-black hover:bg-zinc-200"
                >
                  Baslat
                </button>
              </motion.div>
            )}

            {phase === "running" && (
              <motion.div
                key="lyrics"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {lyrics.map((line, i) => (
                  <motion.p
                    key={line.id}
                    animate={{
                      opacity: i === activeIndex ? 1 : 0.25,
                      scale: i === activeIndex ? 1.05 : 1,
                    }}
                    className={`text-2xl transition-all md:text-4xl ${
                      i === activeIndex ? "font-bold text-white" : "text-zinc-500"
                    }`}
                  >
                    {line.text}
                  </motion.p>
                ))}
              </motion.div>
            )}

            {(phase === "scoring" || phase === "done") && scoreResult && (
              <motion.div
                key="score"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <p className="text-6xl font-bold md:text-8xl">{scoreResult.total}</p>
                <p className="text-xl text-zinc-300 md:text-2xl">{scoreResult.message}</p>
                <div className="mx-auto max-w-xs space-y-2 text-left text-sm text-zinc-400">
                  <p>Ritim: {scoreResult.breakdown.rhythm}</p>
                  <p>Enerji: {scoreResult.breakdown.energy}</p>
                  <p>Ton Dengesi: {scoreResult.breakdown.pitchStability}</p>
                  <p>Bonus: {scoreResult.breakdown.crowdBonus}</p>
                </div>
                {phase !== "scoring" && (
                  <button
                    onClick={nextRound}
                    className="mt-6 rounded-xl border border-white/30 bg-white px-8 py-3 text-base font-semibold text-black hover:bg-zinc-200"
                  >
                    Sonraki Sarkici
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-2 text-xs text-zinc-500">
        <span>F: Tam ekran</span>
        <span>Mikrofon: {isAnalyzing ? "Aktif" : "Beklemede"}</span>
      </div>
    </div>
  );
}