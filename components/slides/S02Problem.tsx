'use client';

import { useRef } from 'react';
import { Check } from 'lucide-react';
import { SlideFrame } from '@/components/ui/SlideFrame';
import { Glass } from '@/components/ui/Glass';
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap';

const OLD_WAY = [
  'Rehearse answers alone, in the mirror',
  'Skim a PDF of "top 100 questions"',
  'Hear "be more confident" as feedback',
  'Guess which students are ready',
];

const NEW_WAY = [
  'A live voice interview, with real pressure',
  'A scored report you can act on',
  'A mentor that remembers you',
  'Readiness your college can see',
];

export default function Problem() {
  const ref = useRef<HTMLDivElement>(null);

  // After the slide arrives, strike through the old way one line at a time, then light up the new one.
  useGSAP(
    () => {
      const strikes = gsap.utils.toArray<HTMLElement>('[data-strike]');
      const checks = gsap.utils.toArray<HTMLElement>('[data-check]');
      if (reducedMotion()) {
        gsap.set(strikes, { scaleX: 1 });
        gsap.set(checks, { opacity: 1, x: 0 });
        return;
      }
      gsap.set(strikes, { scaleX: 0, transformOrigin: 'left center' });
      gsap.set(checks, { opacity: 0, x: 24 });
      const tl = gsap.timeline({ delay: 1.2 });
      strikes.forEach((s, i) => {
        tl.to(s, { scaleX: 1, duration: 0.55, ease: 'power3.inOut' }, i * 0.5);
        tl.to(s.parentElement, { opacity: 0.38, duration: 0.4 }, i * 0.5 + 0.35);
      });
      tl.to(checks, { opacity: 1, x: 0, duration: 0.7, stagger: 0.18, ease: 'expo.out' }, strikes.length * 0.5 - 0.2);
    },
    { scope: ref },
  );

  return (
    <SlideFrame
      eyebrow="The problem"
      title={
        <>
          Interview prep is <span className="text-gradient">lonely</span>, vague and invisible.
        </>
      }
    >
      <div ref={ref} className="grid h-full content-center gap-6 lg:grid-cols-2 lg:gap-10">
        <Glass data-in="left" className="p-[clamp(1.25rem,2.4vw,2.25rem)]">
          <p className="eyebrow mb-5 !text-faint">The old way</p>
          <ul className="grid gap-5">
            {OLD_WAY.map((t) => (
              <li key={t} className="relative text-[clamp(1.05rem,1.7vw,1.5rem)] font-medium tracking-tight">
                <span className="relative inline-block">
                  {t}
                  <span
                    data-strike
                    className="absolute left-0 top-1/2 h-[2px] w-full origin-left bg-rose"
                    style={{ transform: 'scaleX(0)' }}
                  />
                </span>
              </li>
            ))}
          </ul>
        </Glass>

        <Glass hot data-in="right" className="p-[clamp(1.25rem,2.4vw,2.25rem)]">
          <p className="eyebrow mb-5">With Pass98</p>
          <ul className="grid gap-5">
            {NEW_WAY.map((t) => (
              <li
                key={t}
                data-check
                className="flex items-center gap-3 text-[clamp(1.05rem,1.7vw,1.5rem)] font-medium tracking-tight"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-white">
                  <Check className="size-4" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </Glass>
      </div>
    </SlideFrame>
  );
}
