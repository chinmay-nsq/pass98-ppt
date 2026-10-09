'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { SlideFrame } from '@/components/ui/SlideFrame';
import { cn } from '@/lib/cn';
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap';
import type { SlideProps } from './types';

interface Layer {
  label: string;
  tone: string;
  items: string[];
}

const LAYERS: Layer[] = [
  { label: 'Experience', tone: 'text-sky', items: ['React 19 + Vite', 'Capacitor iOS & Android', 'Three.js · Monaco · LiveKit client'] },
  { label: 'Core API', tone: 'text-brand', items: ['Express 4 + TypeScript', 'Zod validation', 'JWT + role guards', 'Plan & usage gates', 'Rate limiters'] },
  {
    label: 'Intelligence & services',
    tone: 'text-amber',
    items: ['OpenAI', 'Deepgram', 'Cartesia', 'LiveKit Cloud + Python agent', 'Judge0', 'Razorpay', 'Office365 SMTP'],
  },
  { label: 'Data', tone: 'text-mint', items: ['PostgreSQL · Prisma 7 · 51 models', 'Redis', 'AWS S3'] },
];

export default function Architecture({ step }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  // Dots travel down the connectors so the diagram reads as a live system, not a picture.
  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.utils.toArray<HTMLElement>('[data-flow]').forEach((d, i) => {
        gsap.fromTo(
          d,
          { y: 0, opacity: 0 },
          { y: 38, opacity: 1, duration: 1.3, repeat: -1, ease: 'power1.inOut', delay: i * 0.45, repeatDelay: 0.2 },
        );
      });
    },
    { scope: root },
  );

  // Builds: 0 = experience + API, 1 = services, 2 = data.
  const visible = [true, true, step >= 1, step >= 2];

  return (
    <SlideFrame
      eyebrow="Under the hood"
      title={
        <>
          Four layers, <span className="text-gradient">one</span> codebase.
        </>
      }
    >
      <div ref={root} className="mx-auto grid h-full w-full max-w-4xl content-center">
        {LAYERS.map((l, i) => (
          <div key={l.label}>
            <motion.div
              initial={false}
              animate={visible[i] ? { opacity: 1, y: 0 } : { opacity: 0.08, y: 14 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="glass grid items-center gap-3 rounded-2xl px-5 py-4 md:grid-cols-[11rem_1fr]"
            >
              <p className={cn('mono text-[0.72rem] font-semibold uppercase tracking-[0.22em]', l.tone)}>{l.label}</p>
              <div className="flex flex-wrap gap-2">
                {l.items.map((it) => (
                  <span
                    key={it}
                    className="rounded-lg border border-white/10 bg-white/[0.045] px-3 py-1.5 text-[0.82rem] font-medium tracking-tight"
                  >
                    {it}
                  </span>
                ))}
              </div>
            </motion.div>
            {i < LAYERS.length - 1 && (
              <div className="relative mx-auto h-[clamp(1.25rem,3.4vh,2.25rem)] w-px bg-gradient-to-b from-brand/60 to-brand/10">
                <span data-flow className="absolute -left-[3px] top-0 size-[7px] rounded-full bg-brand shadow-[0_0_10px_#fe6600]" />
              </div>
            )}
          </div>
        ))}
        <p className="mono mt-4 text-center text-[0.68rem] tracking-widest text-faint">
          {step < 2 ? 'PRESS → TO REVEAL THE NEXT LAYER' : 'WEB ON VERCEL · API ON AWS · VOICE AGENT ON LIVEKIT CLOUD'}
        </p>
      </div>
    </SlideFrame>
  );
}
