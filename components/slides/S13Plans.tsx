'use client';

import { useRef } from 'react';
import { SlideFrame } from '@/components/ui/SlideFrame';
import { Glass, Chip } from '@/components/ui/Glass';
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap';

// Launch defaults from prisma/seedPlans.ts. The live values are edited in the admin console.
const FEATURES = [
  { key: 'Mock interviews', trial: 2, pro: 10, max: 50 },
  { key: 'Interview profiles', trial: 2, pro: 10, max: 50 },
  { key: 'Leo messages', trial: 20, pro: 200, max: 1000 },
  { key: 'AI tool uses', trial: 5, pro: 100, max: 500 },
];

const PLANS = [
  { id: 'trial', name: 'Trial', tag: '7 days, no card', hot: false },
  { id: 'pro', name: 'PRO', tag: 'Monthly or annual', hot: false },
  { id: 'max', name: 'MAX', tag: 'Most popular', hot: true },
] as const;

export default function Plans() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const still = reducedMotion();
      gsap.utils.toArray<HTMLElement>('[data-meter]').forEach((m, i) => {
        gsap.fromTo(
          m,
          { scaleX: 0 },
          {
            scaleX: Math.max(Number(m.dataset.meter), 0.035),
            duration: still ? 0 : 1.3,
            delay: still ? 0 : 0.9 + i * 0.045,
            ease: 'expo.out',
            transformOrigin: 'left center',
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <SlideFrame
      eyebrow="Business model"
      title={
        <>
          Start free. <span className="text-gradient">Grow</span> with usage.
        </>
      }
      subtitle="Every limit is metered per feature and frozen at purchase, so what a customer buys never changes under them."
    >
      <div ref={root} className="grid h-full content-center gap-5">
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => (
            <Glass key={p.id} hot={p.hot} data-in className="p-[clamp(1.1rem,2vw,1.75rem)]">
              <div className="mb-5 flex items-baseline justify-between">
                <h3 className="text-2xl font-bold tracking-tight">{p.name}</h3>
                <span className={p.hot ? 'mono text-[0.68rem] text-brand-soft' : 'mono text-[0.68rem] text-faint'}>
                  {p.tag.toUpperCase()}
                </span>
              </div>
              <ul className="grid gap-3.5">
                {FEATURES.map((f) => {
                  const v = f[p.id];
                  return (
                    <li key={f.key}>
                      <div className="mb-1.5 flex items-baseline justify-between text-sm">
                        <span className="text-dim">{f.key}</span>
                        <span className="tabular font-semibold">{v.toLocaleString('en-US')}</span>
                      </div>
                      <span className="block h-1.5 overflow-hidden rounded-full bg-white/10">
                        <span
                          data-meter={v / f.max}
                          className="block h-full rounded-full bg-gradient-to-r from-brand to-brand-soft"
                          style={{ transform: 'scaleX(0)' }}
                        />
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Glass>
          ))}
        </div>

        <div data-in className="flex flex-wrap items-center justify-center gap-2">
          <Chip tone="brand">Razorpay checkout</Chip>
          <Chip>INR or USD, auto-detected</Chip>
          <Chip>Server-side pricing</Chip>
          <Chip>Coupons up to 90%, private up to 99%</Chip>
          <Chip>Upgrades keep unused days</Chip>
        </div>
      </div>
    </SlideFrame>
  );
}
