"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  AudioTelemetry,
  BluetoothState,
  Participant,
  PerformanceScore,
  SpotifyTrack,
} from "@/types/karaoke";
import { useSpotifyAuth } from "@/hooks/useSpotifyAuth";
import { useSpotifyPlayer } from "@/hooks/useSpotifyPlayer";
import { useWebBluetooth } from "@/hooks/useWebBluetooth";
import { useAudioScoring } from "@/hooks/useAudioScoring";

interface KaraokeContextValue {
  /* Participants & queue */
  participants: Participant[];
  queue: Participant[];
  addParticipant: (name: string) => void;
  removeParticipant: (id: string) => void;
  moveQueue: (id: string, direction: -1 | 1) => void;
  rotateQueue: () => void;
  currentSinger: Participant | undefined;

  /* Spotify */
  spotifyToken: string;
  isSpotifyConnected: boolean;
  spotifyLogin: () => void;
  spotifyLogout: () => void;
  spotifyDeviceId: string;
  spotifyReady: boolean;
  spotifyError: string;

  /* Track */
  selectedTrack: SpotifyTrack | undefined;
  setSelectedTrack: (track: SpotifyTrack | undefined) => void;

  /* Bluetooth */
  bluetoothState: BluetoothState;
  connectBluetooth: () => Promise<void>;
  disconnectBluetooth: () => void;

  /* Audio analysis */
  isAnalyzing: boolean;
  audioError: string;
  startAnalysis: () => Promise<void>;
  stopAnalysis: () => Promise<AudioTelemetry>;
  scorePerformance: (t: AudioTelemetry) => PerformanceScore;

  /* Performance state */
  isRunning: boolean;
  elapsedMs: number;
  telemetry: AudioTelemetry | undefined;
  score: PerformanceScore | undefined;
  setTelemetry: (t: AudioTelemetry | undefined) => void;
  setScore: (s: PerformanceScore | undefined) => void;
  setIsRunning: (v: boolean) => void;
  setElapsedMs: (v: number) => void;
}

const KaraokeContext = createContext<KaraokeContextValue | null>(null);

export function useKaraokeContext() {
  const ctx = useContext(KaraokeContext);
  if (!ctx) throw new Error("useKaraokeContext must be used within KaraokeProvider");
  return ctx;
}

export function KaraokeProvider({ children }: { children: React.ReactNode }) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [queue, setQueue] = useState<Participant[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | undefined>();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [telemetry, setTelemetry] = useState<AudioTelemetry | undefined>();
  const [score, setScore] = useState<PerformanceScore | undefined>();

  const {
    token: spotifyToken,
    isConnected: isSpotifyConnected,
    login: spotifyLogin,
    logout: spotifyLogout,
  } = useSpotifyAuth();

  const {
    deviceId: spotifyDeviceId,
    isReady: spotifyReady,
    error: spotifyError,
  } = useSpotifyPlayer(spotifyToken);

  const {
    state: bluetoothState,
    connect: connectBluetooth,
    disconnect: disconnectBluetooth,
  } = useWebBluetooth();

  const {
    isAnalyzing,
    error: audioError,
    startAnalysis,
    stopAnalysis,
    scorePerformance,
  } = useAudioScoring();

  const addParticipant = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const p: Participant = { id: crypto.randomUUID(), name: trimmed };
    setParticipants((prev) => [...prev, p]);
    setQueue((prev) => [...prev, p]);
  }, []);

  const removeParticipant = useCallback((id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setQueue((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const moveQueue = useCallback((id: string, direction: -1 | 1) => {
    setQueue((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      const target = idx + direction;
      if (idx < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [picked] = next.splice(idx, 1);
      next.splice(target, 0, picked);
      return next;
    });
  }, []);

  const rotateQueue = useCallback(() => {
    setQueue((prev) => (prev.length <= 1 ? prev : [...prev.slice(1), prev[0]]));
  }, []);

  const currentSinger = queue[0];

  const value = useMemo<KaraokeContextValue>(
    () => ({
      participants,
      queue,
      addParticipant,
      removeParticipant,
      moveQueue,
      rotateQueue,
      currentSinger,
      spotifyToken,
      isSpotifyConnected,
      spotifyLogin,
      spotifyLogout,
      spotifyDeviceId,
      spotifyReady,
      spotifyError,
      selectedTrack,
      setSelectedTrack,
      bluetoothState,
      connectBluetooth,
      disconnectBluetooth,
      isAnalyzing,
      audioError,
      startAnalysis,
      stopAnalysis,
      scorePerformance,
      isRunning,
      elapsedMs,
      telemetry,
      score,
      setTelemetry,
      setScore,
      setIsRunning,
      setElapsedMs,
    }),
    [
      participants,
      queue,
      addParticipant,
      removeParticipant,
      moveQueue,
      rotateQueue,
      currentSinger,
      spotifyToken,
      isSpotifyConnected,
      spotifyLogin,
      spotifyLogout,
      spotifyDeviceId,
      spotifyReady,
      spotifyError,
      selectedTrack,
      bluetoothState,
      connectBluetooth,
      disconnectBluetooth,
      isAnalyzing,
      audioError,
      startAnalysis,
      stopAnalysis,
      scorePerformance,
      isRunning,
      elapsedMs,
      telemetry,
      score,
    ],
  );

  return <KaraokeContext.Provider value={value}>{children}</KaraokeContext.Provider>;
}