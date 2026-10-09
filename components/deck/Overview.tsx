'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { SLIDES } from '@/components/slides';
import { cn } from '@/lib/cn';

/** Press O: every slide as a tile, grouped by the order they are presented. Click to jump. */
export function Overview({
  current,
  onPick,
  onClose,
}: {
  current: number;
  onPick: (i: number) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="absolute inset-0 z-40 overflow-y-auto bg-bg/90 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-[1400px] px-[clamp(1rem,4vw,3rem)] pb-16 pt-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="eyebrow mb-2">Overview</p>
            <h2 className="title-lg">{SLIDES.length} slides</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close overview"
            className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/5 hover:border-brand/50"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {SLIDES.map((s, i) => (
            <motion.button
              key={s.id}
              type="button"
              onClick={() => onPick(i)}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.018, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className={cn(
                'group relative aspect-[16/10] overflow-hidden rounded-2xl border p-4 text-left transition-colors',
                i === current
                  ? 'border-brand/70 bg-brand/10 shadow-[0_0_40px_-12px_rgb(254_102_0/0.7)]'
                  : 'border-white/10 bg-white/[0.035] hover:border-brand/40',
              )}
            >
              <span className="mono text-[0.7rem] text-faint">{String(i + 1).padStart(2, '0')}</span>
              <span className="mt-1 block text-[0.95rem] font-semibold leading-tight tracking-tight">{s.title}</span>
              <span className="eyebrow absolute bottom-3 left-4 text-[0.6rem] opacity-80">{s.section}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
