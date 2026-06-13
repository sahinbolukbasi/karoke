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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,#1ac7ff_0%,#0d1132_28%,transparent_55%),radial-gradient(circle_at_85%_15%,#ff42b6_0%,#170f3f_35%,transparent_60%),radial-gradient(circle_at_50%_90%,#ffd365_0%,#190e35_26%,transparent_56%),linear-gradient(160deg,#05060f_0%,#0d122d_52%,#1b0b2e_100%)] px-4 py-8 text-white md:px-10">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mb-8 max-w-6xl rounded-3xl border border-white/20 bg-white/10 p-6 text-center shadow-2xl backdrop-blur-xl"
      >
        <p className="text-xs uppercase tracking-[0.38em] text-cyan-100/90">Neon Stage</p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-wide md:text-5xl">Art Karaoke Platformu</h1>
        <p className="mt-3 text-sm text-cyan-50/85 md:text-base">
          Lobi, Spotify entegrasyonu, Bluetooth cihaz baglantisi, ritim analizi ve eglenceli puanlama tek sahnede.
        </p>
      </motion.header>

      <main className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-2">
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

        <LyricsPanel lines={lyrics} activeIndex={activeLyricIndex} elapsedSeconds={elapsedMs / 1000} />

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
      </main>
    </div>
  );
}
