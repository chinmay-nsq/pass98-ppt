'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';

/** Press N: the speaker notes for the slide on screen. */
export function NotesPanel({ text }: { text: string }) {
  return (
    <motion.aside
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="glass absolute bottom-20 left-1/2 z-30 w-[min(46rem,calc(100%-2rem))] -translate-x-1/2 rounded-2xl p-5"
    >
      <p className="eyebrow mb-2">Speaker notes</p>
      <p className="text-[0.95rem] leading-relaxed text-ink/90">{text}</p>
    </motion.aside>
  );
}

const KEYS: [string, string][] = [
  ['→  ↓  Space', 'Next build or slide'],
  ['←  ↑  Backspace', 'Previous'],
  ['Home / End', 'First / last slide'],
  ['O', 'Overview grid'],
  ['N', 'Speaker notes'],
  ['F', 'Fullscreen'],
  ['?', 'This help'],
  ['Swipe', 'Touch screens'],
];

export function HelpPanel({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 8 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="glass w-[min(28rem,100%)] rounded-3xl p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight">Keyboard</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-dim hover:text-ink">
            <X className="size-4" />
          </button>
        </div>
        <dl className="grid gap-2.5">
          {KEYS.map(([k, d]) => (
            <div key={k} className="flex items-center justify-between gap-4 text-sm">
              <dt className="mono rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs">{k}</dt>
              <dd className="text-dim">{d}</dd>
            </div>
          ))}
        </dl>
      </motion.div>
    </motion.div>
  );
}
