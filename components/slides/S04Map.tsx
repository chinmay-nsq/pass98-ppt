'use client';

import { useRef } from 'react';
import { SlideFrame } from '@/components/ui/SlideFrame';
import { Counter } from '@/components/ui/Counter';
import { DOMAINS, TOTAL_FEATURES } from '@/lib/data';
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap';

export default function ProductMap() {
  const grid = useRef<HTMLDivElement>(null);

  // Tiles fly in from scattered positions and settle into the grid.
  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.from('[data-tile]', {
        opacity: 0,
        scale: 0.55,
        x: () => gsap.utils.random(-140, 140),
        y: () => gsap.utils.random(-90, 90),
        rotation: () => gsap.utils.random(-14, 14),
        duration: 1.3,
        delay: 0.5,
        ease: 'expo.out',
        stagger: { amount: 0.95, from: 'random' },
      });
    },
    { scope: grid },
  );

  return (
    <SlideFrame
      eyebrow="What is inside"
      title={
        <>
          Fourteen domains. <span className="text-gradient">One</span> platform.
        </>
      }
      subtitle={
        <>
          <Counter to={TOTAL_FEATURES} className="font-semibold text-ink" /> features checked against the code, from
          sign-up to the admin console.
        </>
      }
    >
      <div
        ref={grid}
        className="grid h-full content-center gap-2.5 grid-cols-[repeat(auto-fit,minmax(10.5rem,1fr))] sm:gap-3"
      >
        {DOMAINS.map((d) => (
          // The outer box is moved by GSAP and must not carry a CSS transition (the two fight each
          // frame); the hover lift lives on the inner card.
          <div key={d.id} data-tile>
            <div className="glass group relative h-full overflow-hidden rounded-2xl p-4 transition duration-300 hover:-translate-y-1 hover:border-brand/50">
              <div className="absolute -right-6 -top-6 size-20 rounded-full bg-brand/0 blur-2xl transition duration-500 group-hover:bg-brand/30" />
              <d.icon className="size-[1.35rem] text-brand" strokeWidth={1.8} />
              <p className="mt-3 text-[0.95rem] font-semibold leading-tight tracking-tight">{d.name}</p>
              <p className="mono mt-1.5 text-xs text-faint">
                <span className="text-brand-soft">{d.count}</span> features
              </p>
            </div>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}
