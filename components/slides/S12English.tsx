'use client';

import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Play, ShieldCheck } from 'lucide-react';
import { SlideFrame } from '@/components/ui/SlideFrame';
import { Glass, Chip } from '@/components/ui/Glass';
import { cn } from '@/lib/cn';
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap';
import type { SlideProps } from './types';

type Grade = 'A' | 'B' | 'C' | 'D';

const SKILLS: { name: string; grade: Grade }[] = [
  { name: 'Expression', grade: 'B' },
  { name: 'Grammar', grade: 'C' },
  { name: 'Fluency', grade: 'B' },
  { name: 'Vocabulary', grade: 'A' },
  { name: 'Structure', grade: 'B' },
];

const TONE: Record<Grade, string> = {
  A: 'border-mint/50 bg-mint/15 text-mint',
  B: 'border-sky/50 bg-sky/15 text-sky',
  C: 'border-amber/50 bg-amber/15 text-amber',
  D: 'border-rose/50 bg-rose/15 text-rose',
};

export default function English({ step }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const still = reducedMotion();
      gsap.fromTo(
        '[data-grade]',
        { scale: 0.3, opacity: 0, rotation: -18 },
        {
          scale: 1,
          opacity: 1,
          rotation: 0,
          duration: still ? 0 : 0.8,
          delay: still ? 0 : 1,
          stagger: 0.14,
          ease: 'back.out(2)',
        },
      );
      gsap.fromTo(
        '[data-pace]',
        { scaleX: 0 },
        { scaleX: 0.62, duration: still ? 0 : 1.2, delay: still ? 0 : 1.9, ease: 'expo.out', transformOrigin: 'left center' },
      );
      if (!still) {
        gsap.to('[data-wave]', {
          scaleY: () => gsap.utils.random(0.3, 1),
          duration: 0.35,
          repeat: -1,
          yoyo: true,
          stagger: 0.04,
          ease: 'sine.inOut',
        });
      }
    },
    { scope: root },
  );

  return (
    <SlideFrame
      eyebrow="Practice English"
      title={
        <>
          Say it <span className="text-gradient">better</span>, then say it again.
        </>
      }
      subtitle="One focus, up to three fixes, and a better version of your own answer."
    >
      <div ref={root} className="grid h-full items-center gap-6 lg:grid-cols-2">
        {/* Grade board */}
        <Glass data-in="left" className="p-[clamp(1.1rem,2vw,1.75rem)]">
          <p className="eyebrow mb-4">Grade board</p>
          <ul className="grid gap-3">
            {SKILLS.map((s) => (
              <li key={s.name} className="flex items-center justify-between">
                <span className="text-[clamp(1rem,1.4vw,1.2rem)] font-medium tracking-tight">{s.name}</span>
                <span
                  data-grade
                  className={cn('grid size-10 place-items-center rounded-xl border text-lg font-bold', TONE[s.grade])}
                >
                  {s.grade}
                </span>
              </li>
            ))}
            <li className="grid gap-2 pt-1">
              <div className="flex items-center justify-between text-sm text-dim">
                <span>Pace</span>
                <span className="mono text-xs">comfortable</span>
              </div>
              <span className="h-2 overflow-hidden rounded-full bg-white/10">
                <span data-pace className="block h-full w-full rounded-full bg-gradient-to-r from-brand to-brand-soft" style={{ transform: 'scaleX(0)' }} />
              </span>
            </li>
          </ul>
        </Glass>

        {/* Fix and better answer */}
        <div className="grid gap-4">
          <Glass data-in="right" className="p-[clamp(1.1rem,2vw,1.75rem)]">
            <p className="eyebrow mb-3">Fix 1 · Present perfect</p>
            <p className="text-[clamp(1.05rem,1.6vw,1.4rem)] leading-snug">
              “I{' '}
              <span className="rounded bg-rose/15 px-1 text-rose line-through decoration-2">am working</span>{' '}
              <span className="text-faint">here</span>{' '}
              <span className="rounded bg-rose/15 px-1 text-rose line-through decoration-2">since 3 years</span>.”
            </p>
            <p className="mt-3 text-[clamp(1.05rem,1.6vw,1.4rem)] leading-snug">
              “I{' '}
              <span className="rounded bg-mint/15 px-1 text-mint">have been working</span>{' '}
              <span className="text-faint">here</span>{' '}
              <span className="rounded bg-mint/15 px-1 text-mint">for three years</span>.”
            </p>
          </Glass>

          <div data-in="right" className="min-h-[7.5rem]">
            <AnimatePresence mode="wait">
              {step === 0 ? (
                <motion.div
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-wrap items-center gap-2"
                >
                  <Chip tone="brand">Grades computed in code</Chip>
                  <Chip>Precision over recall</Chip>
                  <Chip>4 levels · 3 exercises</Chip>
                  <Chip tone="mint">
                    <ShieldCheck className="size-3.5" /> 24-hour audio buffer
                  </Chip>
                  <p className="mono mt-2 w-full text-[0.68rem] tracking-widest text-faint">PRESS → FOR THE BETTER ANSWER</p>
                </motion.div>
              ) : (
                <motion.div
                  key="better"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Glass hot className="flex items-center gap-4 p-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand text-white shadow-[0_0_28px_rgb(254_102_0/0.7)]">
                      <Play className="size-5 translate-x-0.5" fill="currentColor" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">Your answer, improved</p>
                      <div className="mt-2 flex h-6 items-center gap-[3px]" aria-hidden>
                        {Array.from({ length: 34 }, (_, i) => (
                          <span key={i} data-wave className="h-full w-[3px] rounded-full bg-brand/80" />
                        ))}
                      </div>
                    </div>
                  </Glass>
                  <p className="mt-2 text-xs text-dim">Listen to it read aloud, then try again and compare before and after.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
