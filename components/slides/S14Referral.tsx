'use client';

import { useRef } from 'react';
import { Gift, Link2, Trophy, UserPlus, type LucideIcon } from 'lucide-react';
import { SlideFrame } from '@/components/ui/SlideFrame';
import { Chip } from '@/components/ui/Glass';
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap';

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Link2, title: 'You share your link', body: 'One code per user, with a copy and WhatsApp button.' },
  { icon: UserPlus, title: 'A friend joins', body: 'Their trial becomes 14 days instead of 7.' },
  { icon: Trophy, title: 'They finish an interview', body: 'The reward fires on activity, never on sign-up.' },
  { icon: Gift, title: 'You are rewarded', body: '+7 days, +20 Leo messages and +1 mock interview.' },
];

const SIZE = 360;
const R = 128;
const POS = [0, 90, 180, 270].map((deg) => {
  const rad = (deg * Math.PI) / 180;
  return { x: SIZE / 2 + Math.sin(rad) * R, y: SIZE / 2 - Math.cos(rad) * R };
});

export default function Referral() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const still = reducedMotion();
      const arc = root.current?.querySelector<SVGCircleElement>('[data-loop]');
      if (arc) {
        const len = arc.getTotalLength();
        gsap.fromTo(
          arc,
          { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: still ? 0 : 2.2, delay: still ? 0 : 0.8, ease: 'power2.inOut' },
        );
      }
      gsap.fromTo(
        '[data-stop]',
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: still ? 0 : 0.7, delay: still ? 0 : 0.9, stagger: 0.35, ease: 'back.out(2.2)', transformOrigin: '50% 50%' },
      );
      // A bright dot circles the loop. Plain trigonometry, so no plugin has to read the rotated path.
      const runner = root.current?.querySelector<SVGCircleElement>('[data-runner]');
      if (runner) {
        const place = (deg: number) => {
          const rad = (deg * Math.PI) / 180;
          runner.setAttribute('cx', String(SIZE / 2 + Math.sin(rad) * R));
          runner.setAttribute('cy', String(SIZE / 2 - Math.cos(rad) * R));
        };
        place(0);
        if (!still) {
          const a = { deg: 0 };
          gsap.to(a, { deg: 360, duration: 7, repeat: -1, ease: 'none', delay: 2.2, onUpdate: () => place(a.deg) });
        }
      }
    },
    { scope: root },
  );

  return (
    <SlideFrame
      eyebrow="Growth loop"
      title={
        <>
          Give 7 days. <span className="text-gradient">Get 7 days.</span>
        </>
      }
    >
      <div ref={root} className="grid h-full items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
        <ol className="grid gap-5">
          {STEPS.map((s, i) => (
            <li key={s.title} data-in="left" className="flex items-start gap-4">
              <span className="mono mt-1 w-6 text-sm text-brand-soft">0{i + 1}</span>
              <div>
                <p className="text-[clamp(1.1rem,1.7vw,1.45rem)] font-semibold tracking-tight">{s.title}</p>
                <p className="text-sm text-dim">{s.body}</p>
              </div>
            </li>
          ))}
          <li data-in="left" className="flex flex-wrap gap-2 pt-2">
            <Chip tone="mint">Self-referral is structurally impossible</Chip>
            <Chip>Capped at 10 rewards a month</Chip>
          </li>
        </ol>

        <div data-in="zoom" className="relative mx-auto aspect-square w-[min(88vw,26rem)]">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-full" aria-hidden>
            <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="rgb(255 255 255 / 0.1)" strokeWidth="1.5" />
            <circle
              data-loop
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke="url(#loopg)"
              strokeWidth="2.5"
              strokeLinecap="round"
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
            />
            <defs>
              <linearGradient id="loopg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffb27a" />
                <stop offset="100%" stopColor="#fb4d02" />
              </linearGradient>
            </defs>
            <circle data-runner cx={SIZE / 2} cy={SIZE / 2 - R} r="6" fill="#fff" style={{ filter: 'drop-shadow(0 0 8px #fe6600)' }} />
          </svg>

          {/* The four stops are plain HTML on top of the SVG ring: GSAP scales HTML around its own
              centre, whereas SVG groups pick up a shifted origin. */}
          {STEPS.map((s, i) => (
            <span
              key={s.title}
              data-stop
              className="absolute grid size-[17%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[1.5px] border-brand bg-[#0d0807] text-brand shadow-[0_0_0_7px_rgb(254_102_0/0.12),0_0_30px_-4px_rgb(254_102_0/0.6)]"
              style={{ left: `${(POS[i].x / SIZE) * 100}%`, top: `${(POS[i].y / SIZE) * 100}%` }}
            >
              <s.icon className="size-[48%]" />
            </span>
          ))}

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-5xl font-bold tracking-tighter text-gradient">7 + 7</p>
            <p className="mono mt-1 text-[0.65rem] tracking-widest text-faint">DAYS EACH</p>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}
