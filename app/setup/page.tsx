"use client";

import { motion } from "framer-motion";
import { useKaraokeContext } from "@/components/KaraokeContext";

export default function SetupPage() {
  const {
    isSpotifyConnected,
    spotifyReady,
    spotifyError,
    spotifyLogin,
    spotifyLogout,
    bluetoothState,
    connectBluetooth,
    disconnectBluetooth,
  } = useKaraokeContext();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Adim 1</p>
        <h1 className="mt-2 text-3xl">Kurulum</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Baglantilari sirasiyla yap. Her adimda neyin hazir oldugunu goreceksin.
        </p>
      </motion.div>

      <div className="mt-10 space-y-6">
        {/* Spotify */}
        <motion.section
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-white/20 bg-[#121212] p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl">Spotify</h2>
              <p className="mt-1 text-sm text-zinc-400">
                {isSpotifyConnected
                  ? "Hesabin bagli. Web oynatici hazir."
                  : "Spotify hesabinla giris yap."}
              </p>
            </div>
            {!isSpotifyConnected ? (
              <button
                onClick={spotifyLogin}
                className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-zinc-200"
              >
                Baglan
              </button>
            ) : (
              <button
                onClick={spotifyLogout}
                className="rounded-xl border border-white/25 bg-zinc-900 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
              >
                Cikis Yap
              </button>
            )}
          </div>
          {spotifyError && (
            <p className="mt-2 text-xs text-zinc-400">{spotifyError}</p>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                spotifyReady ? "bg-white" : "bg-zinc-600"
              }`}
            />
            {spotifyReady ? "Web oynatici hazir" : "Web oynatici bekleniyor"}
          </div>
        </motion.section>

        {/* Bluetooth */}
        <motion.section
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl border border-white/20 bg-[#121212] p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl">Bluetooth Hoparlor / Mikrofon</h2>
              <p className="mt-1 text-sm text-zinc-400">
                {bluetoothState.isConnected
                  ? `Bagli: ${bluetoothState.deviceName}`
                  : bluetoothState.isSupported
                    ? "Bir cihaz bagla."
                    : "Tarayicin Web Bluetooth desteklemiyor."}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={connectBluetooth}
                disabled={!bluetoothState.isSupported}
                className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Baglan
              </button>
              <button
                onClick={disconnectBluetooth}
                className="rounded-xl border border-white/25 bg-zinc-900 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-700"
              >
                Kes
              </button>
            </div>
          </div>
          {bluetoothState.error && (
            <p className="mt-2 text-xs text-zinc-400">{bluetoothState.error}</p>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                bluetoothState.isConnected ? "bg-white" : "bg-zinc-600"
              }`}
            />
            {bluetoothState.isConnected ? "Bagli" : "Bagli degil"}
          </div>
        </motion.section>

        {/* Mikrofon */}
        <motion.section
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl border border-white/20 bg-[#121212] p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl">Cihaz Mikrofonu</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Sarki soylerken sesini analiz etmek icin kullanilacak.
              </p>
            </div>
            <p className="text-xs text-zinc-500">Karaoke ekraninda otomatik istenir</p>
          </div>
        </motion.section>
      </div>

      <div className="mt-10 text-center">
        <a
          href="/select"
          className="inline-block rounded-xl border border-white/30 bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
        >
          Sarki Secimine Git
        </a>
      </div>
    </div>
  );
}