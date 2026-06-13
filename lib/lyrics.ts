import { LyricLine, SpotifyTrack } from "@/types/karaoke";

const words = [
  "Isiklar",
  "sahnede",
  "kalp",
  "ritimde",
  "mikrofon",
  "parliyor",
  "gece",
  "sarkiyla",
  "cosuyor",
  "eller",
  "havada",
  "tempo",
  "yukseliyor",
  "sozler",
  "bizimle",
  "akiyor",
];

export function buildDemoLyrics(track?: SpotifyTrack): LyricLine[] {
  const trackName = track?.name ?? "Gecenin Sarkisi";
  const artistName = track?.artist ?? "Sahne Yildizi";

  const lines: LyricLine[] = [
    {
      id: "intro",
      startMs: 0,
      endMs: 3500,
      text: `${trackName} - ${artistName}`,
    },
  ];

  for (let i = 0; i < 12; i += 1) {
    const startMs = 3500 + i * 3000;
    const endMs = startMs + 2900;
    const first = words[(i * 2) % words.length];
    const second = words[(i * 2 + 3) % words.length];
    const third = words[(i * 2 + 6) % words.length];

    lines.push({
      id: `line-${i}`,
      startMs,
      endMs,
      text: `${first} ${second}, ${third}!`,
    });
  }

  return lines;
}

export function getActiveLyricIndex(lines: LyricLine[], elapsedMs: number): number {
  return lines.findIndex((line) => elapsedMs >= line.startMs && elapsedMs < line.endMs);
}
