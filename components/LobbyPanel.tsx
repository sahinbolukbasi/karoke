"use client";

import { Participant } from "@/types/karaoke";
import { motion } from "framer-motion";

interface LobbyPanelProps {
  participants: Participant[];
  queue: Participant[];
  newName: string;
  onNameChange: (value: string) => void;
  onAddParticipant: () => void;
  onRemoveParticipant: (id: string) => void;
  onMoveQueueUp: (id: string) => void;
  onMoveQueueDown: (id: string) => void;
}

export function LobbyPanel({
  participants,
  queue,
  newName,
  onNameChange,
  onAddParticipant,
  onRemoveParticipant,
  onMoveQueueUp,
  onMoveQueueDown,
}: LobbyPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/30 bg-white/15 p-5 shadow-2xl backdrop-blur-xl"
    >
      <h2 className="text-xl font-semibold tracking-wide text-white">Lobi ve Sira</h2>
      <p className="mt-1 text-sm text-cyan-100/90">Sahnedeki sirayi yonet, geceyi akit.</p>

      <div className="mt-4 flex gap-2">
        <input
          value={newName}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="Katilimci adi"
          className="w-full rounded-xl border border-white/30 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/50 focus:border-cyan-300"
        />
        <button
          onClick={onAddParticipant}
          className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200"
        >
          Ekle
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-fuchsia-100">Katilimcilar</h3>
          <ul className="mt-2 space-y-2">
            {participants.length === 0 && <li className="text-sm text-white/70">Henuz kimse eklenmedi.</li>}
            {participants.map((participant) => (
              <li
                key={participant.id}
                className="flex items-center justify-between rounded-xl bg-black/25 px-3 py-2 text-sm text-white"
              >
                <span>{participant.name}</span>
                <button
                  onClick={() => onRemoveParticipant(participant.id)}
                  className="rounded-lg bg-rose-300/90 px-2 py-1 text-xs font-semibold text-black hover:bg-rose-200"
                >
                  Cikar
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-fuchsia-100">Sarki Sirasi</h3>
          <ul className="mt-2 space-y-2">
            {queue.length === 0 && <li className="text-sm text-white/70">Sira bos.</li>}
            {queue.map((participant, index) => (
              <li
                key={participant.id}
                className="flex items-center justify-between rounded-xl bg-black/25 px-3 py-2 text-sm text-white"
              >
                <span>
                  {index + 1}. {participant.name}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onMoveQueueUp(participant.id)}
                    className="rounded-md bg-white/25 px-2 py-1 text-xs hover:bg-white/40"
                  >
                    Yukari
                  </button>
                  <button
                    onClick={() => onMoveQueueDown(participant.id)}
                    className="rounded-md bg-white/25 px-2 py-1 text-xs hover:bg-white/40"
                  >
                    Asagi
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.section>
  );
}
