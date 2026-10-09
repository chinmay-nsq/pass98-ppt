'use client';

import { useRef } from 'react';
import { AudioLines, Ear, Languages, MessageSquareText, Volume2, type LucideIcon } from 'lucide-react';
import { SlideFrame } from '@/components/ui/SlideFrame';
import { Glass } from '@/components/ui/Glass';
import { cn } from '@/lib/cn';
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap';
import type { SlideProps } from './types';

const POINTS = [
  'Live sessions of 15 to 60 minutes',
  'One short question per turn, two follow-ups at most',
  'Saved after every turn, so a dropped call resumes',
  'Never coaches, so the score stays honest',
];

interface Stage {
  icon: LucideIcon;
  name: string;
  does: string;
}

const STAGES: Stage[] = [
  { icon: Ear, name: 'Silero VAD', does: 'Hears when you stop talking' },
  { icon: Languages, name: 'Deepgram nova-3', does: 'Turns speech into text' },
  { icon: MessageSquareText, name: 'GPT-4o mini', does: 'Decides what to ask next' },
  { icon: Volume2, name: 'Cartesia sonic-2', does: 'Speaks it back, in Anna’s voice' },
];

const BARS = 28;

export default function Voice({ step }: SlideProps) {
  const room = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      // Anna's voice: a row of bars that breathe at random heights.
      gsap.utils.toArray<HTMLElement>('[data-bar]').forEach((bar, i) => {
        gsap.to(bar, {
          scaleY: () => gsap.utils.random(0.25, 1),
          duration: () => gsap.utils.random(0.28, 0.6),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.03,
          transformOrigin: '50% 50%',
        });
      });
      gsap.to('[data-halo]', { scale: 1.5, opacity: 0, duration: 2.2, repeat: -1, ease: 'power1.out', stagger: 0.7 });
      // Conversation arrives line by line.
      gsap.from('[data-line]', { opacity: 0, y: 14, duration: 0.7, stagger: 1.1, delay: 1.4, ease: 'power3.out' });
    },
    { scope: room },
  );

  // step 0 shows the room; steps 1-4 walk the voice pipeline stage by stage.
  const active = step - 1;

  return (
    <SlideFrame
      eyebrow="The core experience"
      title={
        <>
          Meet Anna, your <span className="text-gradient">voice interviewer</span>.
        </>
      }
    >
      <div className="grid h-full items-center gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <ul className="grid gap-4">
          {POINTS.map((p) => (
            <li key={p} data-in="left" className="flex items-start gap-3 text-[clamp(1rem,1.5vw,1.3rem)] text-ink/90">
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand shadow-[0_0_10px_rgb(254_102_0)]" />
              {p}
            </li>
          ))}
        </ul>

        <div className="grid gap-5">
          {/* The room */}
          <Glass data-in="right" className="overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/8 px-4 py-3">
              <span className="size-2.5 rounded-full bg-rose/70" />
              <span className="size-2.5 rounded-full bg-amber/70" />
              <span className="size-2.5 rounded-full bg-mint/70" />
              <span className="ml-2 text-xs text-dim">Live interview · Frontend Developer</span>
              <span className="mono ml-auto flex items-center gap-1.5 text-[0.7rem] text-mint">
                <span className="size-1.5 animate-pulse-soft rounded-full bg-mint" /> 12:48
              </span>
            </div>

            <div ref={room} className="grid gap-4 p-5 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="relative mx-auto grid size-24 place-items-center">
                <span data-halo className="absolute inset-0 rounded-full border border-brand/60" />
                <span data-halo className="absolute inset-0 rounded-full border border-brand/60" />
                <span className="relative grid size-20 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-deep text-3xl font-bold text-white shadow-[0_0_40px_rgb(254_102_0/0.55)]">
                  A
                </span>
              </div>

              <div className="grid gap-3">
                <div data-line className="max-w-[92%] rounded-2xl rounded-tl-sm bg-white/[0.07] px-4 py-2.5 text-sm">
                  Walk me through how you would speed up a slow React list.
                </div>
                <div data-line className="ml-auto max-w-[92%] rounded-2xl rounded-tr-sm bg-brand/15 px-4 py-2.5 text-sm">
                  I would start with virtualisation, then memoise the row component…
                </div>
                <div className="flex h-9 items-center gap-[3px]" aria-hidden>
                  <AudioLines className="mr-1 size-4 text-brand" />
                  {Array.from({ length: BARS }, (_, i) => (
                    <span key={i} data-bar className="h-full w-[3px] rounded-full bg-brand/80" />
                  ))}
                </div>
              </div>
            </div>
          </Glass>

          {/* The pipeline, revealed stage by stage */}
          <div data-in className="grid gap-2 sm:grid-cols-4">
            {STAGES.map((s, i) => (
              <div
                key={s.name}
                className={cn(
                  'rounded-2xl border p-3.5 transition-all duration-500',
                  active === i
                    ? 'border-brand/70 bg-brand/15 shadow-[0_0_34px_-8px_rgb(254_102_0/0.8)]'
                    : i < active
                      ? 'border-brand/25 bg-white/[0.04]'
                      : 'border-white/10 bg-white/[0.025]',
                )}
              >
                <s.icon className={cn('size-5 transition-colors', i <= active ? 'text-brand' : 'text-faint')} />
                <p className="mt-2 text-[0.85rem] font-semibold tracking-tight">{s.name}</p>
                <p className="mt-0.5 text-[0.75rem] leading-snug text-dim">{s.does}</p>
              </div>
            ))}
          </div>
          <p data-in="fade" className="mono text-center text-[0.7rem] tracking-widest text-faint">
            ALL OF IT OVER LIVEKIT · PRESS → TO WALK THE PIPELINE
          </p>
        </div>
      </div>
    </SlideFrame>
  );
}
