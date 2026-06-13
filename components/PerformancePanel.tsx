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
      className="rounded-3xl border border-white/30 bg-white/15 p-5 shadow-2xl backdrop-blur-xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-wide text-white">Performans ve Puanlama</h2>
          <p className="mt-1 text-sm text-cyan-100/90">
            Simdiki sahne: <span className="font-semibold text-white">{singerName || "Secilmedi"}</span>
          </p>
          <p className="text-xs text-fuchsia-100/90">Parca: {selectedTrack?.name ?? "Secilmedi"}</p>
        </div>

        {!isRunning ? (
          <button
            onClick={onStart}
            className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-200"
          >
            Performansi Baslat
          </button>
        ) : (
          <button
            onClick={onStop}
            className="rounded-xl bg-rose-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-rose-200"
          >
            Bitir ve Puanla
          </button>
        )}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/25 bg-black/25 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-cyan-100">Bluetooth Baglanti</h3>
          <p className="mt-2 text-sm text-white/85">
            Durum: {bluetoothState.isConnected ? `Bagli (${bluetoothState.deviceName})` : "Bagli degil"}
          </p>
          {!bluetoothState.isSupported && <p className="mt-1 text-xs text-rose-200">Tarayici desteklemiyor.</p>}
          {bluetoothState.error && <p className="mt-1 text-xs text-rose-200">{bluetoothState.error}</p>}
          <div className="mt-3 flex gap-2">
            <button
              onClick={onBluetoothConnect}
              disabled={!bluetoothState.isSupported}
              className="rounded-lg bg-cyan-300 px-3 py-2 text-xs font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Mikrofon/Hoparlor Bagla
            </button>
            <button
              onClick={onBluetoothDisconnect}
              className="rounded-lg bg-zinc-200/90 px-3 py-2 text-xs font-semibold text-slate-900"
            >
              Baglantiyi Kes
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/25 bg-black/25 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-cyan-100">Ses Analizi</h3>
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
          className="mt-5 rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-200/80 via-fuchsia-200/75 to-cyan-200/80 p-4 text-slate-950"
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
