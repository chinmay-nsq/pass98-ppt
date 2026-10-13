'use client';

import { useRef } from 'react';
import { Building2, Check, GraduationCap, ShieldCheck } from 'lucide-react';
import { SlideFrame } from '@/components/ui/SlideFrame';
import { Glass } from '@/components/ui/Glass';
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap';

const OLD_WAY = [
  'You practise alone',
  'You never say answers out loud',
  'You never find out what went wrong',
  "Colleges can't tell who is ready",
];

const NEW_WAY = [
  'An AI interviews you, out loud',
  'You get a score, and what to fix',
  'An AI mentor coaches you',
  'Your college sees who is ready',
];

/** Who uses Pass98: one login, and each person lands in their own workspace. */
const WHO = [
  {
    icon: GraduationCap,
    name: 'Students',
    line: 'Practise, get scored, get hired',
  },
  {
    icon: Building2,
    name: 'Colleges',
    line: 'Add students and departments, see who is ready',
  },
  {
    icon: ShieldCheck,
    name: 'Our team',
    line: 'Plans, support and the whole platform',
  },
];

export default function Problem() {
  const ref = useRef<HTMLDivElement>(null);

  // After the slide arrives, strike through the old way one line at a time, then light up the new one.
  useGSAP(
    () => {
      const strikes = gsap.utils.toArray<HTMLElement>('[data-strike]');
      const checks = gsap.utils.toArray<HTMLElement>('[data-check]');
      if (reducedMotion()) {
        gsap.set(strikes, { backgroundSize: '100% 3px' });
        gsap.set(checks, { opacity: 1, x: 0 });
        return;
      }
      gsap.set(strikes, { backgroundSize: '0% 3px' });
      gsap.set(checks, { opacity: 0, x: 24 });
      const tl = gsap.timeline({ delay: 1.2 });
      strikes.forEach((s, i) => {
        // The line is a background on the inline text, so it follows the words onto a second line.
        tl.to(s, { backgroundSize: '100% 3px', duration: 0.7, ease: 'power2.inOut' }, i * 0.5);
        // Dim a little, but stay readable from the back of the room.
        tl.to(s, { color: 'rgb(255 255 255 / 0.62)', duration: 0.4 }, i * 0.5 + 0.45);
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
          Interview prep is <span className="text-gradient">lonely</span>, and feedback comes too late.
        </>
      }
    >
      <div ref={ref} className="grid h-full content-center gap-[clamp(1rem,2.6vh,1.75rem)]">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
          <Glass data-in="left" className="p-[clamp(1.25rem,2.4vw,2.25rem)]">
            <p className="eyebrow mb-5 !text-faint">Today</p>
            <ul className="grid gap-[clamp(0.75rem,2vh,1.25rem)]">
              {OLD_WAY.map((t) => (
                <li key={t} className="text-[clamp(1.15rem,1.85vw,1.65rem)] font-medium leading-snug tracking-tight">
                  <span
                    data-strike
                    className="bg-no-repeat text-ink"
                    style={{
                      backgroundImage: 'linear-gradient(var(--color-rose), var(--color-rose))',
                      backgroundPosition: '0 58%',
                      backgroundSize: '0% 3px',
                    }}
                  >
                    {t}
                  </span>
                </li>
              ))}
            </ul>
          </Glass>

          <Glass hot data-in="right" className="p-[clamp(1.25rem,2.4vw,2.25rem)]">
            <p className="eyebrow mb-5">With Pass98</p>
            <ul className="grid gap-[clamp(0.75rem,2vh,1.25rem)]">
              {NEW_WAY.map((t) => (
                <li
                  key={t}
                  data-check
                  className="flex items-center gap-3 text-[clamp(1.15rem,1.85vw,1.65rem)] font-medium leading-snug tracking-tight"
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

        <div data-in data-delay="0.5" className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <p className="eyebrow !text-faint">Who uses it</p>
          {WHO.map((w) => (
            <div key={w.name} className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-brand/40 bg-brand/10 text-brand">
                <w.icon className="size-[1.1rem]" />
              </span>
              <div>
                <p className="font-semibold leading-tight tracking-tight">{w.name}</p>
                <p className="text-[0.8rem] leading-tight text-dim">{w.line}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SlideFrame>
  );
}
