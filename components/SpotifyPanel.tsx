"use client";

import { SpotifyTrack } from "@/types/karaoke";
import { motion } from "framer-motion";

interface SpotifyPanelProps {
  isSpotifyConnected: boolean;
  spotifyReady: boolean;
  spotifyError: string;
  query: string;
  tracks: SpotifyTrack[];
  selectedTrack?: SpotifyTrack;
  loading: boolean;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  onTrackSelect: (track: SpotifyTrack) => void;
  onLogin: () => void;
  onLogout: () => void;
}

export function SpotifyPanel({
  isSpotifyConnected,
  spotifyReady,
  spotifyError,
  query,
  tracks,
  selectedTrack,
  loading,
  onQueryChange,
  onSearch,
  onTrackSelect,
  onLogin,
  onLogout,
}: SpotifyPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="rounded-3xl border border-white/30 bg-white/15 p-5 shadow-2xl backdrop-blur-xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-wide text-white">Spotify Entegrasyonu</h2>
          <p className="mt-1 text-sm text-cyan-100/90">Sarki sec, oynat, sahneyi ac.</p>
        </div>
        {!isSpotifyConnected ? (
          <button
            onClick={onLogin}
            className="rounded-xl bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-200"
          >
            Spotify Baglan
          </button>
        ) : (
          <button
            onClick={onLogout}
            className="rounded-xl bg-zinc-200/90 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-zinc-100"
          >
            Cikisi Yap
          </button>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Sarki veya sanatci ara"
          className="w-full rounded-xl border border-white/30 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-cyan-300"
        />
        <button
          onClick={onSearch}
          disabled={!isSpotifyConnected || loading}
          className="rounded-xl bg-fuchsia-300 px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Ariyor" : "Ara"}
        </button>
      </div>

      <div className="mt-2 text-xs text-cyan-50/80">
        Oynatici durumu: {spotifyReady ? "Hazir" : "Hazirlaniyor"}
      </div>
      {spotifyError && <div className="mt-1 text-xs text-rose-200">{spotifyError}</div>}

      <ul className="mt-4 max-h-72 space-y-2 overflow-auto pr-1">
        {tracks.length === 0 && <li className="text-sm text-white/70">Sonuc yok.</li>}
        {tracks.map((track) => {
          const active = selectedTrack?.id === track.id;
          return (
            <li
              key={track.id}
              className={`rounded-xl border px-3 py-2 text-sm transition ${
                active
                  ? "border-cyan-200 bg-cyan-300/20 text-cyan-50"
                  : "border-white/25 bg-black/25 text-white"
              }`}
            >
              <button className="w-full text-left" onClick={() => onTrackSelect(track)}>
                <div className="font-semibold">{track.name}</div>
                <div className="text-xs opacity-80">
                  {track.artist} - {track.album}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </motion.section>
  );
}
