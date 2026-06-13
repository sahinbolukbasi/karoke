"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LobbyPanel } from "@/components/LobbyPanel";
import { SpotifyPanel } from "@/components/SpotifyPanel";
import { LyricsPanel } from "@/components/LyricsPanel";
import { PerformancePanel } from "@/components/PerformancePanel";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer";
import { useWebBluetooth } from "@/hooks/useWebBluetooth";
import { useAudioScoring } from "@/hooks/useAudioScoring";
import { buildDemoLyrics, getActiveLyricIndex } from "@/lib/lyrics";
import { searchSpotifyTracks, startSpotifyPlayback } from "@/lib/spotify";
import { AudioTelemetry, Participant, PerformanceScore, SpotifyTrack } from "@/types/karaoke";

type ModalSection = "lobby" | "spotify" | "lyrics" | "performance";

function reorderQueue(queue: Participant[], id: string, direction: -1 | 1): Participant[] {
  const index = queue.findIndex((participant) => participant.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= queue.length) {
    return queue;
  }

  const next = [...queue];
  const [picked] = next.splice(index, 1);
  next.splice(target, 0, picked);
  return next;
}

export function KaraokeApp() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [queue, setQueue] = useState<Participant[]>([]);
  const [newName, setNewName] = useState("");

  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | undefined>();
  const [isSearching, setIsSearching] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [telemetry, setTelemetry] = useState<AudioTelemetry | undefined>();
  const [score, setScore] = useState<PerformanceScore | undefined>();
  const [activeModal, setActiveModal] = useState<ModalSection | null>(null);

  const { token, isConnected, login, logout } = useSpotifyAuth();
  const { deviceId, isReady: spotifyReady, error: spotifyError } = useSpotifyPlayer(token);
  const { state: bluetoothState, connect: connectBluetooth, disconnect: disconnectBluetooth } = useWebBluetooth();
  const { isAnalyzing, error: audioError, startAnalysis, stopAnalysis, scorePerformance } = useAudioScoring();

  const lyrics = useMemo(() => buildDemoLyrics(selectedTrack), [selectedTrack]);
  const activeLyricIndex = useMemo(() => getActiveLyricIndex(lyrics, elapsedMs), [lyrics, elapsedMs]);
  const singer = queue[0];

  const addParticipant = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      return;
    }

    const participant: Participant = {
      id: crypto.randomUUID(),
      name: trimmed,
    };

    setParticipants((prev) => [...prev, participant]);
    setQueue((prev) => [...prev, participant]);
    setNewName("");
  };

  const removeParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((participant) => participant.id !== id));
    setQueue((prev) => prev.filter((participant) => participant.id !== id));
  };

  const rotateQueue = () => {
    setQueue((prev) => {
      if (prev.length <= 1) {
        return prev;
      }
      return [...prev.slice(1), prev[0]];
    });
  };

  const searchTracks = async () => {
    if (!token) {
      return;
    }

    try {
      setIsSearching(true);
      const found = await searchSpotifyTracks(token, query);
      setTracks(found);
    } catch {
      setTracks([]);
      alert("Spotify arama tamamlanamadi.");
    } finally {
      setIsSearching(false);
    }
  };

  const startPerformance = async () => {
    if (!singer || !selectedTrack) {
      alert("Once bir sarkici ve sarki sec.");
      return;
    }

    setTelemetry(undefined);
    setScore(undefined);
    setElapsedMs(0);
    setIsRunning(true);

    await startAnalysis();

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 100);

    window.setTimeout(() => {
      if (isRunning) {
        window.clearInterval(timer);
      }
    }, 180000);

    try {
      if (token && deviceId) {
        await startSpotifyPlayback(token, selectedTrack.uri, deviceId);
      }
    } catch {
      // Spotify playback is optional in local demo mode.
    }

    (window as unknown as { karaokeTimer?: number }).karaokeTimer = timer;
  };

  const stopPerformance = async () => {
    const timer = (window as unknown as { karaokeTimer?: number }).karaokeTimer;
    if (timer) {
      window.clearInterval(timer);
    }

    const telemetryResult = await stopAnalysis();
    const scoreResult = scorePerformance(telemetryResult);

    setTelemetry(telemetryResult);
    setScore(scoreResult);
    setIsRunning(false);
    rotateQueue();
  };

  const sectionCards: Array<{ id: ModalSection; title: string; description: string }> = [
    {
      id: "lobby",
      title: "Lobi",
      description: "Katilimcilari ekle, sirayi duzenle.",
    },
    {
      id: "spotify",
      title: "Spotify",
      description: "Sarki ara, sec ve oynatmaya hazirla.",
    },
    {
      id: "lyrics",
      title: "Lyrics",
      description: "Akan sozleri net bir alanda takip et.",
    },
    {
      id: "performance",
      title: "Performans",
      description: "Bluetooth, analiz ve puanlama adimi.",
    },
  ];

  const closeModal = () => setActiveModal(null);

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-8 text-white md:px-10">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mb-8 max-w-6xl rounded-3xl border border-white/20 bg-[#111111] p-6 text-center shadow-2xl"
      >
        <p className="text-xs uppercase tracking-[0.28em] text-zinc-300">Karaoke Suite</p>
        <h1 className="mt-2 text-3xl md:text-5xl">Monochrome Stage</h1>
        <p className="mt-3 text-sm text-zinc-300 md:text-base">
          Siyah-beyaz, sade ve modern panel mimarisi. Tum bolumler ayri popup pencerelerde.
        </p>
      </motion.header>

      <main className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_2fr]">
        <section className="rounded-3xl border border-white/20 bg-[#101010] p-6">
          <h2 className="text-xl">Gece Ozeti</h2>
          <div className="mt-4 space-y-3 text-sm text-zinc-300">
            <p>Katilimci sayisi: {participants.length}</p>
            <p>Siradaki: {singer?.name ?? "Yok"}</p>
            <p>Secilen sarki: {selectedTrack?.name ?? "Yok"}</p>
            <p>Spotify: {isConnected ? "Bagli" : "Bagli degil"}</p>
            <p>Bluetooth: {bluetoothState.isConnected ? "Bagli" : "Bagli degil"}</p>
            <p>Son puan: {score?.total ?? "-"}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-white/20 bg-[#101010] p-6">
          <h2 className="text-xl">Bolumler</h2>
          <p className="mt-1 text-sm text-zinc-400">Her bolumu ayri pencerede acarak duzenli calis.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {sectionCards.map((section) => (
              <article key={section.id} className="rounded-2xl border border-white/15 bg-black p-4">
                <h3 className="text-lg">{section.title}</h3>
                <p className="mt-1 text-sm text-zinc-400">{section.description}</p>
                <button
                  onClick={() => setActiveModal(section.id)}
                  className="mt-4 rounded-xl border border-white/30 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200"
                >
                  Popupu Ac
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>

      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-3xl border border-white/25 bg-[#111111] p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl">
                {activeModal === "lobby" && "Lobi"}
                {activeModal === "spotify" && "Spotify"}
                {activeModal === "lyrics" && "Lyrics"}
                {activeModal === "performance" && "Performans"}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-xl border border-white/30 px-3 py-2 text-sm hover:bg-white hover:text-black"
              >
                Kapat
              </button>
            </div>

            {activeModal === "lobby" && (
              <LobbyPanel
                participants={participants}
                queue={queue}
                newName={newName}
                onNameChange={setNewName}
                onAddParticipant={addParticipant}
                onRemoveParticipant={removeParticipant}
                onMoveQueueUp={(id) => setQueue((prev) => reorderQueue(prev, id, -1))}
                onMoveQueueDown={(id) => setQueue((prev) => reorderQueue(prev, id, 1))}
              />
            )}

            {activeModal === "spotify" && (
              <SpotifyPanel
                isSpotifyConnected={isConnected}
                spotifyReady={spotifyReady}
                spotifyError={spotifyError}
                query={query}
                tracks={tracks}
                selectedTrack={selectedTrack}
                loading={isSearching}
                onQueryChange={setQuery}
                onSearch={searchTracks}
                onTrackSelect={setSelectedTrack}
                onLogin={login}
                onLogout={logout}
              />
            )}

            {activeModal === "lyrics" && (
              <LyricsPanel lines={lyrics} activeIndex={activeLyricIndex} elapsedSeconds={elapsedMs / 1000} />
            )}

            {activeModal === "performance" && (
              <PerformancePanel
                singerName={singer?.name ?? "Beklemede"}
                selectedTrack={selectedTrack}
                bluetoothState={bluetoothState}
                onBluetoothConnect={connectBluetooth}
                onBluetoothDisconnect={disconnectBluetooth}
                isRunning={isRunning}
                isAnalyzing={isAnalyzing}
                audioError={audioError}
                telemetry={telemetry}
                score={score}
                onStart={startPerformance}
                onStop={stopPerformance}
              />
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
