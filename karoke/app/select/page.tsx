"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useKaraokeContext } from "@/components/KaraokeContext";
import { searchSpotifyTracks } from "@/lib/spotify";
import { SpotifyTrack } from "@/types/karaoke";

export default function SelectPage() {
  const {
    queue,
    currentSinger,
    addParticipant,
    removeParticipant,
    moveQueue,
    spotifyToken,
    isSpotifyConnected,
    selectedTrack,
    setSelectedTrack,
    spotifyLogin,
  } = useKaraokeContext();

  const [newName, setNewName] = useState("");
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!spotifyToken) return;
    setIsSearching(true);
    try {
      const found = await searchSpotifyTracks(spotifyToken, query);
      setTracks(found);
    } catch {
      setTracks([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = () => {
    addParticipant(newName);
    setNewName("");
  };

  return (
    <div className="relative">
      <div className="bg-mesh" />
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-400 backdrop-blur-sm">
            Adım 2
          </div>
          <h1 className="text-4xl font-light tracking-tight text-white">
            Şarkı Seçimi ve Katılımcılar
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Spotify&apos;da ara, katılımcını belirle, şarkını seç.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* Lobby */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="glass-strong rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white">Katılımcılar ve Sıra</h2>
            </div>

            <div className="flex gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="İsim ekle..."
                className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 backdrop-blur-sm transition focus:border-white/40 focus:ring-1 focus:ring-white/20"
              />
              <button
                onClick={handleAdd}
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all hover:scale-105 hover:shadow-lg hover:shadow-white/20"
              >
                Ekle
              </button>
            </div>

            <ul className="mt-4 max-h-64 space-y-2 overflow-auto pr-1">
              <AnimatePresence>
                {queue.map((p, i) => (
                  <motion.li
                    key={p.id}
                    initial={{ opacity: 0, x: -10, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: "auto" }}
                    exit={{ opacity: 0, x: 10, height: 0 }}
                    className="flex items-center justify-between rounded-xl bg-black/40 px-4 py-2.5 text-sm backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 text-xs font-bold text-zinc-300">
                        {i + 1}
                      </span>
                      <span className="font-medium text-white">{p.name}</span>
                      {i === 0 && (
                        <span className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          Sıradaki
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {i > 0 && (
                        <button
                          onClick={() => moveQueue(p.id, -1)}
                          className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs text-zinc-300 transition hover:bg-white/10 hover:text-white"
                        >
                          ↑
                        </button>
                      )}
                      <button
                        onClick={() => removeParticipant(p.id)}
                        className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs text-zinc-300 transition hover:bg-red-500/20 hover:text-red-400"
                      >
                        ×
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
              {queue.length === 0 && (
                <li className="py-4 text-center text-sm text-zinc-500">Henüz katılımcı yok.</li>
              )}
            </ul>

            <div className="mt-4 border-t border-white/10 pt-3">
              <p className="text-xs text-zinc-500">
                Sıradaki şarkıcı:{" "}
                <span className="font-semibold text-zinc-300">
                  {currentSinger?.name ?? "Bekleniyor"}
                </span>
              </p>
            </div>
          </motion.section>

          {/* Spotify Search */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="glass-strong rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white">Spotify</h2>
            </div>

            {!isSpotifyConnected ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
                  <svg className="h-8 w-8 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                  </svg>
                </div>
                <p className="text-sm text-zinc-400">Önce Spotify bağlantısı yap.</p>
                <button
                  onClick={spotifyLogin}
                  className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25"
                >
                  Spotify'a Bağlan
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Şarkı veya sanatçı ara..."
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-500 backdrop-blur-sm transition focus:border-white/40 focus:ring-1 focus:ring-white/20"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all hover:scale-105 disabled:opacity-50"
                  >
                    {isSearching ? "..." : "Ara"}
                  </button>
                </div>

                <ul className="mt-4 max-h-72 space-y-2 overflow-auto pr-1">
                  <AnimatePresence>
                    {tracks.map((track) => {
                      const active = selectedTrack?.id === track.id;
                      return (
                        <motion.li
                          key={track.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`group cursor-pointer rounded-xl border px-4 py-3 text-sm transition-all ${
                            active
                              ? "border-white/40 bg-white/10 shadow-lg shadow-white/5"
                              : "border-white/10 bg-black/40 hover:border-white/25 hover:bg-white/5"
                          }`}
                          onClick={() => setSelectedTrack(track)}
                        >
                          <div className="font-semibold text-white">{track.name}</div>
                          <div className="mt-1 text-xs text-zinc-400">
                            {track.artist} · {track.album}
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                  {tracks.length === 0 && !isSearching && (
                    <li className="py-4 text-center text-sm text-zinc-500">Sonuç yok.</li>
                  )}
                </ul>
              </>
            )}
          </motion.section>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-10 text-center"
        >
          <Link
            href="/karaoke"
            className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-semibold text-black transition-all hover:scale-105 hover:shadow-xl hover:shadow-white/20"
          >
            Karaoke Başlat
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}