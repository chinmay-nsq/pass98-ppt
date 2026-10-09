'use client';

import { useRef } from 'react';
import { SlideFrame } from '@/components/ui/SlideFrame';
import { Chip } from '@/components/ui/Glass';
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap';

const ITEMS = [
  { tag: 'Retention', title: 'Weakness practice loop', body: 'Turn each report into a dated practice plan that brings people back to prove the improvement.' },
  { tag: 'B2B', title: 'Institute self-serve checkout', body: 'Colleges pay for Enterprise online, with the roster kept in sync.' },
  { tag: 'B2B', title: 'Notifications', body: 'Report-released and billing-lapse notices for institutes and students.' },
  { tag: 'Growth', title: 'Referral credits', body: 'Rewards as checkout discounts, through a credit ledger.' },
  { tag: 'Coaching', title: 'Leo to a human mentor', body: 'A clear hand-off when the question needs a person.' },
  { tag: 'Marketing', title: 'Landing page v2', body: 'Referral-aware hero, FAQ, legal pages and social cards.' },
] as const;

const TONE: Record<string, 'brand' | 'sky' | 'mint' | 'amber' | 'neutral'> = {
  Retention: 'brand',
  B2B: 'sky',
  Growth: 'mint',
  Coaching: 'amber',
  Marketing: 'neutral',
};

export default function Roadmap() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const still = reducedMotion();
      gsap.fromTo(
        '[data-line]',
        { scaleY: 0 },
        { scaleY: 1, duration: still ? 0 : 2, delay: still ? 0 : 0.8, ease: 'power2.inOut', transformOrigin: 'top center' },
      );
      gsap.fromTo(
        '[data-dot]',
        { scale: 0 },
        { scale: 1, duration: still ? 0 : 0.5, delay: still ? 0 : 0.9, stagger: 0.3, ease: 'back.out(3)' },
      );
    },
    { scope: root },
  );

  return (
    <SlideFrame
      eyebrow="What is next"
      title={
        <>
          Designed, documented, <span className="text-gradient">queued</span>.
        </>
      }
      subtitle="Six items already have written plans. None changes the core engine."
    >
      <div ref={root} className="relative mx-auto grid h-full w-full max-w-4xl content-center">
        <div data-line className="absolute bottom-[6%] left-[0.95rem] top-[6%] w-px bg-gradient-to-b from-brand via-brand/50 to-brand/0" />
        <ol className="grid gap-[clamp(0.7rem,2vh,1.4rem)]">
          {ITEMS.map((it) => (
            <li key={it.title} data-in="right" className="relative flex items-start gap-5 pl-1">
              <span data-dot className="relative z-10 mt-1.5 grid size-[1.9rem] shrink-0 place-items-center rounded-full border border-brand bg-bg">
                <span className="size-2 rounded-full bg-brand shadow-[0_0_10px_#fe6600]" />
              </span>
              <div className="grid flex-1 gap-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline sm:gap-x-6">
                <div>
                  <p className="text-[clamp(1.05rem,1.6vw,1.35rem)] font-semibold tracking-tight">{it.title}</p>
                  <p className="text-[0.88rem] leading-snug text-dim">{it.body}</p>
                </div>
                <Chip tone={TONE[it.tag]} className="justify-self-start sm:justify-self-end">
                  {it.tag}
                </Chip>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </SlideFrame>
  );
}
