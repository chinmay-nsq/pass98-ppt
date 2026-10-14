'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SlideFrame } from '@/components/ui/SlideFrame';
import { Glass, Chip } from '@/components/ui/Glass';
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap';
import { readCoverVariant } from '@/lib/coverVariant';
import { CAMEO_EVENT } from '@/components/deck/ScoutCameo';
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
      const verdict = root.current?.querySelector<HTMLElement>('[data-verdict]');
      if (!arc || !num) return;
      // The score first lands at 64. On the first click the Scout jumps on it and stomps it up to 82
      // (in Classic it just climbs to 82). With reduced motion it shows 82 straight away.
      const START = 64;
      const SCORE = 82;
      const setVerdict = (v: number) => verdict && (verdict.textContent = v >= 80 ? 'Interview ready' : 'Almost there');
      if (reducedMotion()) {
        arc.style.strokeDashoffset = String(C * (1 - SCORE / 100));
        num.textContent = String(SCORE);
        setVerdict(SCORE);
        bars.forEach((b) => (b.style.transform = `scaleX(${Number(b.dataset.fill) / 100})`));
        nums.forEach((n) => (n.textContent = n.dataset.num ?? ''));
        return;
      }
      const first = START;
      const state = { v: 0 };
      const show = () => {
        num.textContent = String(Math.round(state.v));
        arc.style.strokeDashoffset = String(C * (1 - state.v / 100));
        setVerdict(state.v);
      };
      gsap.to(state, { v: first, duration: 2, delay: 0.7, ease: 'power3.out', onUpdate: show });

      // Each stomp pumps the score one notch (64 → 70 → 76 → 82): the number squashes, a shockwave
      // ring leaves the gauge and the card shakes. The last one bursts into sparks.
      const card = root.current?.querySelector<HTMLElement>('[data-cameo="gauge-card"]');
      const shock = root.current?.querySelector<HTMLElement>('[data-shock]');
      const sparks = gsap.utils.toArray<HTMLElement>('[data-gspark]', root.current);
      const NOTCHES = [70, 76, SCORE];
      let notch = 0;
      const stomp = (to: number, strength: number) => {
        gsap.killTweensOf(state);
        gsap.to(state, { v: to, duration: 0.45, ease: 'power3.out', onUpdate: show });
        gsap.fromTo(num, { scaleY: 0.6, scaleX: 1.25 }, { scaleY: 1, scaleX: 1, duration: 0.8, ease: 'elastic.out(1,0.35)' });
        if (shock) gsap.fromTo(shock, { scale: 0.55, opacity: 0.9 }, { scale: 1.25 + strength * 0.25, opacity: 0, duration: 0.7, ease: 'power2.out' });
        if (card) {
          gsap.fromTo(
            card,
            { x: 0, y: 0 },
            {
              x: () => gsap.utils.random(-1, 1) * 5 * strength,
              y: () => gsap.utils.random(0, 1) * 6 * strength,
              duration: 0.04,
              repeat: 7,
              yoyo: true,
              onComplete: () => void gsap.set(card, { x: 0, y: 0 }),
            },
          );
        }
        gsap.fromTo(arc, { filter: 'drop-shadow(0 0 26px rgb(254 102 0 / 1))' }, { filter: 'drop-shadow(0 0 10px rgb(254 102 0 / 0.8))', duration: 1 });
      };
      const burst = () => {
        sparks.forEach((sp, i) => {
          const ang = (i / sparks.length) * Math.PI * 2;
          const d = gsap.utils.random(110, 200);
          gsap.fromTo(
            sp,
            { x: 0, y: 0, opacity: 1, scale: gsap.utils.random(0.8, 1.6) },
            { x: Math.cos(ang) * d, y: Math.sin(ang) * d, opacity: 0, scale: 0, duration: gsap.utils.random(0.7, 1.1), ease: 'power3.out' },
          );
        });
        if (verdict) gsap.fromTo(verdict, { scale: 1.5, color: '#fe6600' }, { scale: 1, color: '#f5f1ec', duration: 0.9, ease: 'back.out(2)', clearProps: 'color,scale' });
      };
      const boost = (e: Event) => {
        const what = (e as CustomEvent<string>).detail;
        if (what === 'report-stomp' && notch < NOTCHES.length) {
          stomp(NOTCHES[notch], notch + 1);
          if (++notch === NOTCHES.length) burst();
        } else if (what === 'report-boost' && notch < NOTCHES.length) {
          notch = NOTCHES.length;
          gsap.killTweensOf(state);
          gsap.to(state, { v: SCORE, duration: 1.5, ease: 'power2.out', onUpdate: show });
        }
      };
      window.addEventListener(CAMEO_EVENT, boost);
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
      return () => {
        window.removeEventListener(CAMEO_EVENT, boost);
      };
    },
    { scope: root },
  );

  // The first click starts the boost: the Scout's routine (it waits for this step), or, in Classic,
  // the score simply climbs. If he never arrives (the model failed to load), it still reaches 82.
  const boosted = useRef(false);
  useEffect(() => {
    if (step < 1 || boosted.current) return;
    boosted.current = true;
    const fire = () => window.dispatchEvent(new CustomEvent(CAMEO_EVENT, { detail: 'report-boost' }));
    if (readCoverVariant() === 'classic') {
      fire();
      return;
    }
    const t = window.setTimeout(fire, 12000);
    return () => window.clearTimeout(t);
  }, [step]);

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
        <Glass hot data-in="zoom" data-cameo="gauge-card" className="mx-auto grid place-items-center p-[clamp(1.25rem,2.4vw,2.25rem)]">
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
            {/* Shockwave ring and sparks for the Scout's stomps. */}
            <span data-shock aria-hidden className="pointer-events-none absolute inset-0 rounded-full border-2 border-brand opacity-0 shadow-[0_0_30px_rgb(254_102_0/0.8)]" />
            <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
              {Array.from({ length: 18 }, (_, i) => (
                <span key={i} data-gspark className="absolute -ml-1 -mt-1 size-2 rounded-full bg-brand-soft opacity-0 shadow-[0_0_12px_#fe6600]" />
              ))}
            </div>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <p data-score data-cameo="score" className="tabular text-[clamp(3.4rem,7vw,5.6rem)] font-bold leading-none tracking-tighter">
                  0
                </p>
                <p className="mono mt-1 text-[0.7rem] tracking-widest text-brand-soft">READINESS</p>
              </div>
            </div>
          </div>
          <p data-verdict className="mt-4 text-lg font-semibold tracking-tight">Interview ready</p>
          <p className="text-xs text-faint">Sample report</p>
        </Glass>

        <div className="grid gap-5">
          {/* Skill bars */}
          <Glass data-in="right" data-cameo="report-bars" className="p-[clamp(1.1rem,2vw,1.75rem)]">
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
              {step < 2 ? (
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
                  {step === 1 && <p className="mono text-[0.7rem] tracking-widest text-faint">PRESS → TO SEE THE FOCUS PLAN</p>}
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
