'use client';

import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SlideFrame } from '@/components/ui/SlideFrame';
import { Glass, Chip } from '@/components/ui/Glass';
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap';
import type { SlideProps } from './types';

const SKILLS = [
  { name: 'React', score: 88, tone: '#34d399' },
  { name: 'JavaScript', score: 81, tone: '#34d399' },
  { name: 'System design', score: 64, tone: '#ffb020' },
  { name: 'Testing', score: 52, tone: '#ff8a3d' },
  { name: 'Communication', score: 76, tone: '#ffb020' },
];

const PLAN = [
  { skill: 'Testing', action: 'Explain three test strategies out loud, two minutes each', target: '3 timed explanations' },
  { skill: 'System design', action: 'Talk through one design and name its trade-offs', target: '2 designs, spoken' },
];

const R = 86;
const C = 2 * Math.PI * R;

export default function Report({ step }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const arc = root.current?.querySelector<SVGCircleElement>('[data-arc]');
      const num = root.current?.querySelector<HTMLElement>('[data-score]');
      const bars = gsap.utils.toArray<HTMLElement>('[data-fill]');
      const nums = gsap.utils.toArray<HTMLElement>('[data-num]');
      if (!arc || !num) return;
      const SCORE = 82;
      if (reducedMotion()) {
        arc.style.strokeDashoffset = String(C * (1 - SCORE / 100));
        num.textContent = String(SCORE);
        bars.forEach((b) => (b.style.transform = `scaleX(${Number(b.dataset.fill) / 100})`));
        nums.forEach((n) => (n.textContent = n.dataset.num ?? ''));
        return;
      }
      const state = { v: 0 };
      gsap.to(arc, { strokeDashoffset: C * (1 - SCORE / 100), duration: 2, delay: 0.7, ease: 'power3.out' });
      gsap.to(state, {
        v: SCORE,
        duration: 2,
        delay: 0.7,
        ease: 'power3.out',
        onUpdate: () => (num.textContent = String(Math.round(state.v))),
      });
      bars.forEach((b, i) => {
        gsap.fromTo(
          b,
          { scaleX: 0 },
          { scaleX: Number(b.dataset.fill) / 100, duration: 1.4, delay: 1 + i * 0.12, ease: 'expo.out' },
        );
      });
      nums.forEach((n, i) => {
        const to = Number(n.dataset.num);
        const s = { v: 0 };
        gsap.to(s, {
          v: to,
          duration: 1.4,
          delay: 1 + i * 0.12,
          ease: 'expo.out',
          onUpdate: () => (n.textContent = String(Math.round(s.v))),
        });
      });
    },
    { scope: root },
  );

  return (
    <SlideFrame
      eyebrow="After the call"
      title={
        <>
          A report you can <span className="text-gradient">act on</span>.
        </>
      }
      subtitle="Scored by two AI passes that run in parallel, usually ready within a minute."
    >
      <div ref={root} className="grid h-full items-center gap-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-10">
        {/* Gauge */}
        <Glass hot data-in="zoom" className="mx-auto grid place-items-center p-[clamp(1.25rem,2.4vw,2.25rem)]">
          <div className="relative size-[clamp(11rem,22vw,17rem)]">
            <svg viewBox="0 0 200 200" className="size-full -rotate-90">
              <circle cx="100" cy="100" r={R} fill="none" stroke="rgb(255 255 255 / 0.09)" strokeWidth="11" />
              <circle
                data-arc
                cx="100"
                cy="100"
                r={R}
                fill="none"
                stroke="url(#g)"
                strokeWidth="11"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C}
                style={{ filter: 'drop-shadow(0 0 10px rgb(254 102 0 / 0.8))' }}
              />
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ffb27a" />
                  <stop offset="100%" stopColor="#fb4d02" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <p data-score className="tabular text-[clamp(3.4rem,7vw,5.6rem)] font-bold leading-none tracking-tighter">
                  0
                </p>
                <p className="mono mt-1 text-[0.7rem] tracking-widest text-brand-soft">READINESS</p>
              </div>
            </div>
          </div>
          <p className="mt-4 text-lg font-semibold tracking-tight">Interview ready</p>
          <p className="text-xs text-faint">Sample report</p>
        </Glass>

        <div className="grid gap-5">
          {/* Skill bars */}
          <Glass data-in="right" className="p-[clamp(1.1rem,2vw,1.75rem)]">
            <div className="grid gap-3.5">
              {SKILLS.map((s) => (
                <div key={s.name} className="grid grid-cols-[7.5rem_1fr_2.2rem] items-center gap-3 text-sm sm:grid-cols-[9rem_1fr_2.4rem]">
                  <span className="truncate text-dim">{s.name}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-white/8">
                    <span
                      data-fill={s.score}
                      className="block h-full origin-left rounded-full"
                      style={{ background: s.tone, transform: 'scaleX(0)' }}
                    />
                  </span>
                  <span data-num={s.score} className="tabular text-right font-semibold">
                    0
                  </span>
                </div>
              ))}
            </div>
          </Glass>

          {/* Strengths, then (on the next build) the focus plan */}
          <div data-in="up" className="min-h-[9.5rem]">
            <AnimatePresence mode="wait">
              {step === 0 ? (
                <motion.div
                  key="chips"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                  className="grid gap-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="mono mr-1 text-[0.7rem] tracking-widest text-faint">ALSO IN EVERY REPORT</span>
                    <Chip tone="mint">Strengths</Chip>
                    <Chip tone="amber">Improvements</Chip>
                    <Chip>Best and worst moment</Chip>
                    <Chip>Filler words</Chip>
                    <Chip>Confidence</Chip>
                    <Chip>Q&amp;A breakdown</Chip>
                    <Chip>Trajectory chart</Chip>
                  </div>
                  <p className="mono text-[0.7rem] tracking-widest text-faint">PRESS → TO SEE THE FOCUS PLAN</p>
                </motion.div>
              ) : (
                <motion.div
                  key="plan"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="eyebrow mb-3">Focus plan · weakest first</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {PLAN.map((p) => (
                      <Glass key={p.skill} hot className="p-4">
                        <p className="text-sm font-semibold">{p.skill}</p>
                        <p className="mt-1.5 text-[0.85rem] leading-snug text-dim">{p.action}</p>
                        <p className="mono mt-3 text-[0.72rem] text-brand-soft">TARGET · {p.target}</p>
                      </Glass>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
