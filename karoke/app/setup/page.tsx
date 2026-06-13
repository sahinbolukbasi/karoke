"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useKaraokeContext } from "@/components/KaraokeContext";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cubicBezier = [0.16, 1, 0.3, 1] as [number, number, number, number];

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: cubicBezier } },
};

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

  const steps = [
    {
      num: "01",
      title: "Spotify",
      desc: isSpotifyConnected
        ? "Hesabın bağlı. Web oynatıcı hazır."
        : "Spotify hesabınla giriş yap.",
      connected: isSpotifyConnected,
      ready: spotifyReady,
      readyLabel: "Web oynatıcı hazır",
      pendingLabel: "Web oynatıcı bekleniyor",
      error: spotifyError,
      onConnect: spotifyLogin,
      onDisconnect: spotifyLogout,
      connectLabel: "Bağlan",
      disconnectLabel: "Çıkış Yap",
      gradient: "from-violet-500/10 to-fuchsia-500/10",
      iconGradient: "from-violet-500 to-fuchsia-500",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
        </svg>
      ),
    },
    {
      num: "02",
      title: "Bluetooth Hoparlör / Mikrofon",
      desc: bluetoothState.isConnected
        ? `Bağlı: ${bluetoothState.deviceName}`
        : bluetoothState.isSupported
          ? "Bir cihaz bağla."
          : "Tarayıcın Web Bluetooth desteklemiyor.",
      connected: bluetoothState.isConnected,
      ready: bluetoothState.isConnected,
      readyLabel: "Bağlı",
      pendingLabel: "Bağlı değil",
      error: bluetoothState.error,
      onConnect: connectBluetooth,
      onDisconnect: disconnectBluetooth,
      connectLabel: "Bağlan",
      disconnectLabel: "Kes",
      disabled: !bluetoothState.isSupported,
      gradient: "from-cyan-500/10 to-blue-500/10",
      iconGradient: "from-cyan-500 to-blue-500",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
      ),
    },
    {
      num: "03",
      title: "Cihaz Mikrofonu",
      desc: "Şarkı söylerken sesini analiz etmek için kullanılacak.",
      connected: false,
      ready: false,
      readyLabel: "",
      pendingLabel: "Karaoke ekranında istenir",
      gradient: "from-amber-500/10 to-orange-500/10",
      iconGradient: "from-amber-500 to-orange-500",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="relative">
      <div className="bg-mesh" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-400 backdrop-blur-sm">
            Adım 1
          </div>
          <h1 className="text-4xl font-light tracking-tight text-white">Kurulum</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Bağlantıları sırayla yap. Her adımda neyin hazır olduğunu göreceksin.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-10 space-y-4"
        >
          {steps.map((step) => (
            <motion.section
              key={step.num}
              variants={item}
              className={`glass-strong group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:border-white/20 ${step.disabled ? "opacity-50" : ""}`}
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

              <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${step.iconGradient} text-white shadow-lg`}>
                    {step.icon}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        {step.num}
                      </span>
                      <h2 className="text-lg font-semibold text-white">{step.title}</h2>
                    </div>
                    <p className="mt-1 text-sm text-zinc-400">{step.desc}</p>

                    {/* Status indicator */}
                    {step.readyLabel && (
                      <div className="mt-3 flex items-center gap-2">
                        <span
                          className={`relative flex h-2 w-2`}
                        >
                          {step.connected && (
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          )}
                          <span
                            className={`relative inline-flex h-2 w-2 rounded-full ${
                              step.connected ? "bg-emerald-400" : "bg-zinc-600"
                            }`}
                          />
                        </span>
                        <span className="text-xs text-zinc-500">
                          {step.connected ? step.readyLabel : step.pendingLabel}
                        </span>
                      </div>
                    )}

                    {step.error && (
                      <p className="mt-2 text-xs text-zinc-400">{step.error}</p>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                {step.onConnect && (
                  <div className="flex shrink-0 gap-2">
                    {!step.connected ? (
                      <button
                        onClick={step.onConnect}
                        disabled={step.disabled}
                        className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all hover:scale-105 hover:shadow-lg hover:shadow-white/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {step.connectLabel}
                      </button>
                    ) : (
                      <button
                        onClick={step.onDisconnect}
                        className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10"
                      >
                        {step.disconnectLabel}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.section>
          ))}
        </motion.div>

        {/* Next step CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-10 text-center"
        >
          <Link
            href="/select"
            className="group inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-semibold text-black transition-all hover:scale-105 hover:shadow-xl hover:shadow-white/20"
          >
            Şarkı Seçimine Git
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}