"use client";

import { AudioTelemetry, BluetoothState, PerformanceScore, SpotifyTrack } from "@/types/karaoke";
import { motion } from "framer-motion";

interface PerformancePanelProps {
  singerName: string;
  selectedTrack?: SpotifyTrack;
  bluetoothState: BluetoothState;
  onBluetoothConnect: () => void;
  onBluetoothDisconnect: () => void;
  isRunning: boolean;
  isAnalyzing: boolean;
  audioError: string;
  telemetry?: AudioTelemetry;
  score?: PerformanceScore;
  onStart: () => void;
  onStop: () => void;
}

export function PerformancePanel({
  singerName,
  selectedTrack,
  bluetoothState,
  onBluetoothConnect,
  onBluetoothDisconnect,
  isRunning,
  isAnalyzing,
  audioError,
  telemetry,
  score,
  onStart,
  onStop,
}: PerformancePanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.24 }}
      className="rounded-3xl border border-white/20 bg-[#121212] p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-wide text-white">Performans ve Puanlama</h2>
          <p className="mt-1 text-sm text-zinc-300">
            Simdiki sahne: <span className="font-semibold text-white">{singerName || "Secilmedi"}</span>
          </p>
          <p className="text-xs text-zinc-400">Parca: {selectedTrack?.name ?? "Secilmedi"}</p>
        </div>

        {!isRunning ? (
          <button
            onClick={onStart}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200"
          >
            Performansi Baslat
          </button>
        ) : (
          <button
            onClick={onStop}
            className="rounded-xl border border-white/25 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
          >
            Bitir ve Puanla
          </button>
        )}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/25 bg-black p-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-300">Bluetooth Baglanti</h3>
          <p className="mt-2 text-sm text-white/85">
            Durum: {bluetoothState.isConnected ? `Bagli (${bluetoothState.deviceName})` : "Bagli degil"}
          </p>
          {!bluetoothState.isSupported && <p className="mt-1 text-xs text-rose-200">Tarayici desteklemiyor.</p>}
          {bluetoothState.error && <p className="mt-1 text-xs text-rose-200">{bluetoothState.error}</p>}
          <div className="mt-3 flex gap-2">
            <button
              onClick={onBluetoothConnect}
              disabled={!bluetoothState.isSupported}
              className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              Mikrofon/Hoparlor Bagla
            </button>
            <button
              onClick={onBluetoothDisconnect}
              className="rounded-lg border border-white/25 bg-zinc-900 px-3 py-2 text-xs font-semibold text-white"
            >
              Baglantiyi Kes
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/25 bg-black p-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-300">Ses Analizi</h3>
          <p className="mt-2 text-sm text-white/85">Durum: {isAnalyzing ? "Mikrofon dinleniyor" : "Beklemede"}</p>
          {audioError && <p className="mt-1 text-xs text-rose-200">{audioError}</p>}
          {telemetry && (
            <div className="mt-2 space-y-1 text-xs text-white/85">
              <p>Ortalama enerji: {(telemetry.averageEnergy * 100).toFixed(1)}%</p>
              <p>Ritim dalgalanmasi: {telemetry.varianceEnergy.toFixed(4)}</p>
              <p>Frekans merkezi: {telemetry.spectralCentroid.toFixed(1)}</p>
              <p>Ornek sayisi: {telemetry.samples}</p>
            </div>
          )}
        </div>
      </div>

      {score && (
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="mt-5 rounded-2xl border border-white/35 bg-white p-4 text-black"
        >
          <div className="text-4xl font-black">{score.total}/100</div>
          <p className="mt-1 text-sm font-semibold">{score.message}</p>
          <div className="mt-3 grid gap-2 text-xs md:grid-cols-2">
            <p>Ritim: {score.breakdown.rhythm}</p>
            <p>Enerji: {score.breakdown.energy}</p>
            <p>Ton dengesi: {score.breakdown.pitchStability}</p>
            <p>Kalabalik bonusu: {score.breakdown.crowdBonus}</p>
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}
