"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Adim 2</p>
        <h1 className="mt-2 text-3xl">Sarki Secimi ve Katilimcilar</h1>
        <p className="mt-2 text-sm text-zinc-400">Spotify&apos;da ara, katilimcini belirle, sarkini sec.</p>
      </motion.div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* Lobby */}
        <motion.section
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-white/20 bg-[#121212] p-5"
        >
          <h2 className="text-xl">Katilimcilar ve Sira</h2>
          <div className="mt-4 flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Isim ekle"
              className="w-full rounded-xl border border-white/25 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white"
            />
            <button
              onClick={() => {
                addParticipant(newName);
                setNewName("");
              }}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black"
            >
              Ekle
            </button>
          </div>
          <ul className="mt-4 space-y-2">
            {queue.map((p, i) => (
              <li
                key={p.id}
                className="flex items-center justify-between rounded-xl bg-black px-3 py-2 text-sm"
              >
                <span>
                  {i + 1}. {p.name}
                </span>
                <div className="flex gap-2">
                  {i > 0 && (
                    <button
                      onClick={() => moveQueue(p.id, -1)}
                      className="rounded-md border border-white/25 bg-zinc-900 px-2 py-1 text-xs hover:bg-zinc-700"
                    >
                      Yukari
                    </button>
                  )}
                  <button
                    onClick={() => removeParticipant(p.id)}
                    className="rounded-md border border-white/25 bg-zinc-900 px-2 py-1 text-xs hover:bg-zinc-700"
                  >
                    Sil
                  </button>
                </div>
              </li>
            ))}
            {queue.length === 0 && (
              <li className="text-sm text-zinc-500">Henuz katilimci yok.</li>
            )}
          </ul>
          <div className="mt-4 border-t border-white/15 pt-3 text-xs text-zinc-500">
            Siradaki sarkici: {currentSinger?.name ?? "Bekleniyor"}
          </div>
        </motion.section>

        {/* Spotify Search */}
        <motion.section
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl border border-white/20 bg-[#121212] p-5"
        >
          <h2 className="text-xl">Spotify</h2>
          {!isSpotifyConnected ? (
            <div className="mt-4">
              <p className="text-sm text-zinc-400">Once Spotify baglantisi yap.</p>
              <button
                onClick={spotifyLogin}
                className="mt-3 rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black"
              >
                Baglan
              </button>
            </div>
          ) : (
            <>
              <div className="mt-4 flex gap-2">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Sarki veya sanatci ara"
                  className="w-full rounded-xl border border-white/25 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white"
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
                >
                  {isSearching ? "..." : "Ara"}
                </button>
              </div>
              <ul className="mt-4 max-h-64 space-y-2 overflow-auto pr-1">
                {tracks.map((track) => (
                  <li
                    key={track.id}
                    className={`rounded-xl border px-3 py-2 text-sm transition ${
                      selectedTrack?.id === track.id
                        ? "border-white bg-zinc-800 text-white"
                        : "border-white/25 bg-black text-white"
                    }`}
                  >
                    <button
                      className="w-full text-left"
                      onClick={() => setSelectedTrack(track)}
                    >
                      <div className="font-semibold">{track.name}</div>
                      <div className="text-xs text-zinc-400">
                        {track.artist} - {track.album}
                      </div>
                    </button>
                  </li>
                ))}
                {tracks.length === 0 && (
                  <li className="text-sm text-zinc-500">Sonuc yok.</li>
                )}
              </ul>
            </>
          )}
        </motion.section>
      </div>

      <div className="mt-10 text-center">
        <a
          href="/karaoke"
          className="inline-block rounded-xl border border-white/30 bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
        >
          Karaoke Baslat
        </a>
      </div>
    </div>
  );
}