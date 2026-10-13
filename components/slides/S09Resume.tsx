'use client';

import { useRef } from 'react';
import { FileDown, FileSearch, ScanText, Wand2 } from 'lucide-react';
import { SlideFrame } from '@/components/ui/SlideFrame';
import { Chip } from '@/components/ui/Glass';
import { cn } from '@/lib/cn';
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap';

type Variant = 'Compact' | 'Creative' | 'Executive' | 'Minimal' | 'Modern' | 'Two-column';
const TEMPLATES: Variant[] = ['Compact', 'Creative', 'Executive', 'Minimal', 'Modern', 'Two-column'];

const Line = ({ w = 'w-full', dark = false }: { w?: string; dark?: boolean }) => (
  <span className={cn('block h-[3px] rounded-full', w, dark ? 'bg-neutral-700' : 'bg-neutral-300')} />
);

/** A tiny, abstract rendering of each real template's layout. */
function MiniResume({ variant }: { variant: Variant }) {
  const body = (
    <div className="grid gap-1.5">
      <Line w="w-1/3" dark />
      <Line />
      <Line w="w-11/12" />
      <Line w="w-2/3" />
      <div className="h-1" />
      <Line w="w-1/3" dark />
      <Line />
      <Line w="w-5/6" />
    </div>
  );
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[0.55rem] bg-white p-3 text-neutral-800">
      {variant === 'Compact' && (
        <div className="grid gap-2">
          <div className="grid gap-1">
            <span className="block h-2 w-2/3 rounded-full bg-neutral-800" />
            <Line w="w-1/2" />
          </div>
          {body}
          <Line w="w-10/12" />
          <Line />
        </div>
      )}
      {variant === 'Creative' && (
        <div className="grid h-full grid-cols-[34%_1fr] gap-2">
          <div className="-m-3 mr-0 bg-brand p-2">
            <span className="mx-auto mb-2 block size-6 rounded-full bg-white/80" />
            <div className="grid gap-1">
              <span className="block h-[3px] rounded-full bg-white/80" />
              <span className="block h-[3px] w-2/3 rounded-full bg-white/60" />
              <span className="block h-[3px] w-3/4 rounded-full bg-white/60" />
            </div>
          </div>
          <div className="grid content-start gap-2 pt-1">
            <span className="block h-2 w-3/4 rounded-full bg-neutral-800" />
            {body}
          </div>
        </div>
      )}
      {variant === 'Executive' && (
        <div className="grid gap-2 text-center">
          <span className="mx-auto block h-2 w-1/2 rounded-full bg-neutral-900" />
          <span className="mx-auto block h-[2px] w-full bg-neutral-400" />
          <div className="text-left">{body}</div>
        </div>
      )}
      {variant === 'Minimal' && (
        <div className="grid gap-3 pt-1">
          <span className="block h-2 w-1/3 rounded-full bg-neutral-800" />
          {body}
        </div>
      )}
      {variant === 'Modern' && (
        <div className="-m-3 grid gap-2">
          <div className="grid gap-1 bg-neutral-900 p-3">
            <span className="block h-2 w-1/2 rounded-full bg-white" />
            <span className="block h-[3px] w-1/3 rounded-full bg-brand" />
          </div>
          <div className="px-3">
            {body}
            <div className="mt-2 flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-2 w-6 rounded-full bg-brand/70" />
              ))}
            </div>
          </div>
        </div>
      )}
      {variant === 'Two-column' && (
        <div className="grid h-full grid-cols-[1fr_2fr] gap-2">
          <div className="grid content-start gap-1.5 border-r border-neutral-200 pr-2">
            <span className="block h-2 w-full rounded-full bg-neutral-800" />
            <Line w="w-2/3" />
            <Line w="w-3/4" />
            <Line w="w-1/2" />
          </div>
          <div className="grid content-start gap-2">{body}</div>
        </div>
      )}
    </div>
  );
}

const FEATURES = [
  { icon: ScanText, label: 'AI extraction from PDF or DOCX' },
  { icon: FileSearch, label: 'ATS score and JD keyword match' },
  { icon: Wand2, label: 'AI rewrite for any bullet' },
  { icon: FileDown, label: 'Export to PDF and Word' },
];

export default function Resume() {
  const fan = useRef<HTMLDivElement>(null);

  // Cards start stacked in the centre, then deal out into a fan.
  useGSAP(
    () => {
      const still = reducedMotion();
      const cards = gsap.utils.toArray<HTMLElement>('[data-card]');
      const n = cards.length;
      cards.forEach((c, i) => {
        const t = i / (n - 1) - 0.5; // -0.5 .. 0.5
        gsap.fromTo(
          c,
          { rotation: 0, x: 0, y: 30, opacity: 0, scale: 0.8 },
          {
            rotation: t * 38,
            x: t * 260,
            y: Math.abs(t) * 36,
            opacity: 1,
            scale: 1,
            duration: still ? 0 : 1.3,
            delay: still ? 0 : 0.7 + i * 0.09,
            ease: 'expo.out',
          },
        );
      });
    },
    { scope: fan },
  );

  return (
    <SlideFrame
      eyebrow="Resume suite"
      title={
        <>
          From a PDF to a <span className="text-gradient">job-ready</span> resume.
        </>
      }
    >
      <div className="grid h-full items-center gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <ul className="grid gap-4">
          {FEATURES.map((f) => (
            <li key={f.label} data-in="left" className="flex items-center gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-brand/40 bg-brand/10 text-brand">
                <f.icon className="size-5" />
              </span>
              <span className="text-[clamp(1rem,1.5vw,1.28rem)] font-medium tracking-tight">{f.label}</span>
            </li>
          ))}
          <li data-in="left" className="pt-1">
            <Chip tone="brand">One upload also powers interview questions and Leo</Chip>
          </li>
        </ul>

        <div ref={fan} data-in="fade" className="relative mx-auto h-[clamp(15rem,36vh,24rem)] w-full max-w-[40rem]">
          {TEMPLATES.map((t, i) => (
            <div
              key={t}
              data-card
              className="group absolute left-1/2 top-1/2 h-[clamp(11rem,26vh,17rem)] w-[clamp(7.6rem,14vh,11.6rem)] -translate-x-1/2 -translate-y-1/2 opacity-0 transition-[filter] duration-300 hover:z-20 hover:brightness-110"
              style={{ zIndex: i }}
            >
              <div className="size-full overflow-hidden rounded-xl shadow-[0_24px_50px_-18px_rgb(0_0_0/0.9)] ring-1 ring-white/20 transition duration-300 group-hover:-translate-y-4 group-hover:ring-brand">
                <MiniResume variant={t} />
              </div>
              <p className="mono mt-2 text-center text-[0.62rem] tracking-wider text-dim opacity-0 transition group-hover:opacity-100">
                {t}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SlideFrame>
  );
}
