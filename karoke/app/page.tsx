"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

const features = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
      </svg>
    ),
    title: "Spotify",
    desc: "Giriş yap, şarkı ara, anında oynat",
    gradient: "from-violet-500/20 to-fuchsia-500/20",
    iconGradient: "from-violet-400 to-fuchsia-400",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
    title: "Bluetooth + Mikrofon",
    desc: "Hoparlör ve mikrofon bağlantısı",
    gradient: "from-cyan-500/20 to-blue-500/20",
    iconGradient: "from-cyan-400 to-blue-400",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      </svg>
    ),
    title: "Tam Ekran Karaoke",
    desc: "Akan sözler, anlık puanlama",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconGradient: "from-amber-400 to-orange-400",
  },
];

function FloatingBlob({
  className,
  delay = 0,
}: {
  className: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
      animate={{
        scale: [1, 1.25, 0.9, 1.15, 1],
        x: [0, 20, -15, 10, 0],
        y: [0, -25, 15, -10, 0],
      }}
      transition={{
        duration: 12,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.9]);

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* Background mesh */}
      <div className="bg-mesh" />

      {/* Floating decorative blobs */}
      <FloatingBlob
        className="-top-40 left-[10%] h-72 w-72 bg-violet-500"
        delay={0}
      />
      <FloatingBlob
        className="top-[20%] right-[5%] h-80 w-80 bg-fuchsia-500"
        delay={2}
      />
      <FloatingBlob
        className="bottom-[15%] left-[30%] h-64 w-64 bg-indigo-400"
        delay={4}
      />
      <FloatingBlob
        className="bottom-[30%] right-[20%] h-48 w-48 bg-rose-400"
        delay={6}
      />

      {/* Hero Section */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-20 pb-32 text-center"
      >
        {/* Tag badge */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
          </span>
          <span className="uppercase tracking-[0.3em] text-zinc-300">Yeni Nesil Karaoke Deneyimi</span>
        </motion.div>

        {/* Main heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1 className="text-6xl font-light leading-[1.1] tracking-tight sm:text-7xl md:text-8xl lg:text-9xl">
            <span className="text-white">Mono</span>
            <span className="text-gradient">chrome</span>
            <br />
            <span className="text-gradient-warm">Stage</span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg"
        >
          Spotify hesabınla giriş yap, şarkını seç, mikrofonu aç ve{" "}
          <span className="text-zinc-200">profesyonel karaoke deneyimini</span>{" "}
          evinde yaşa.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.9 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link
            href="/setup"
            className="group relative overflow-hidden rounded-2xl bg-white px-8 py-4 text-sm font-semibold text-black transition-all hover:scale-105 hover-lift"
          >
            <span className="relative z-10 flex items-center gap-2">
              Kuruluma Başla
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
            <div className="absolute inset-0 -z-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-500 opacity-0 blur transition-opacity group-hover:opacity-20" />
          </Link>

          <Link
            href="/select"
            className="group rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10 hover-lift"
          >
            <span className="flex items-center gap-2">
              Direkt Şarkı Seç
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
              </svg>
            </span>
          </Link>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="relative z-10 mx-auto max-w-5xl px-4 pb-24"
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-center text-xs font-medium uppercase tracking-[0.3em] text-zinc-500"
        >
          Neler Sunuyoruz
        </motion.p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${feature.gradient} p-6 backdrop-blur-sm transition-all hover:border-white/20 hover-lift`}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 -z-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              <div className={`relative z-10 mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.iconGradient} p-3 text-white`}>
                {feature.icon}
              </div>

              <h3 className="relative z-10 text-lg font-semibold text-white">
                {feature.title}
              </h3>
              <p className="relative z-10 mt-2 text-sm leading-relaxed text-zinc-400">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom subtle glow line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mx-auto mt-16 h-px max-w-md bg-gradient-to-r from-transparent via-violet-400/50 to-transparent"
        />

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1 }}
          className="mt-6 text-center text-xs text-zinc-600"
        >
          Spotify Premium gerektirir · Chrome veya Edge önerilir
        </motion.p>
      </motion.section>
    </div>
  );
}
