'use client';

import { useRef } from 'react';
import { SlideFrame } from '@/components/ui/SlideFrame';
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap';

const LINES = ['Practice live.', 'Know where you stand.', 'Walk in ready.'];

export default function Close() {
  const root = useRef<HTMLDivElement>(null);

  // A one-off burst of embers behind the closing line.
  useGSAP(
    () => {
      if (reducedMotion()) return;
      const embers = gsap.utils.toArray<HTMLElement>('[data-ember]');
      embers.forEach((e) => {
        const angle = gsap.utils.random(0, Math.PI * 2);
        const dist = gsap.utils.random(120, 460);
        gsap.fromTo(
          e,
          { x: 0, y: 0, opacity: 0, scale: 0.4 },
          {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist * 0.6,
            opacity: 1,
            scale: gsap.utils.random(0.6, 1.5),
            duration: gsap.utils.random(1.4, 2.6),
            delay: 0.9 + gsap.utils.random(0, 0.5),
            ease: 'expo.out',
          },
        );
        gsap.to(e, { opacity: 0, duration: 1.4, delay: 2.4 + gsap.utils.random(0, 1) });
      });
    },
    { scope: root },
  );

  return (
    <SlideFrame center bodyClassName="flex flex-col items-center justify-center">
      <div ref={root} className="relative flex flex-col items-center text-center">
        <div className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden>
          {Array.from({ length: 46 }, (_, i) => (
            <span key={i} data-ember className="absolute size-1.5 rounded-full bg-brand opacity-0 shadow-[0_0_12px_#fe6600]" />
          ))}
        </div>

        <p data-in="fade" className="eyebrow mb-6">
          Pass98
        </p>
        <h1 data-split className="title-xl text-[clamp(4rem,13vw,12rem)] leading-[0.9] tracking-[-0.05em]">
          Level <span className="text-gradient">up.</span>
        </h1>
        <ul className="mt-9 grid gap-1.5">
          {LINES.map((l) => (
            <li key={l} data-in className="text-[clamp(1.1rem,2vw,1.7rem)] text-ink/85">
              {l}
            </li>
          ))}
        </ul>
        <p data-in="fade" data-delay="0.5" className="mono mt-12 text-xs tracking-[0.3em] text-faint">
          THANK YOU · QUESTIONS?
        </p>
      </div>
    </SlideFrame>
  );
}
