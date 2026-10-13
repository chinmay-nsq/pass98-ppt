'use client';

import { useRef } from 'react';
import { BarChart3, ClipboardList, FileSpreadsheet, FolderTree, Mic, type LucideIcon } from 'lucide-react';
import { SlideFrame } from '@/components/ui/SlideFrame';
import { Glass } from '@/components/ui/Glass';
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap';

const FLOW: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: FileSpreadsheet, title: 'Add your students', body: 'Upload one Excel sheet. Everyone gets a login.' },
  { icon: FolderTree, title: 'Make departments', body: 'Group students by branch or batch.' },
  { icon: ClipboardList, title: 'Give an interview', body: 'Pick the role and the date. Done.' },
  { icon: Mic, title: 'Students practise', body: 'With Anna, from any phone or laptop.' },
  { icon: BarChart3, title: 'See who is ready', body: 'A report for every student, and you decide when they see it.' },
];

const WINS = [
  { big: 'Every', label: 'student practises, not just the confident few' },
  { big: 'One', label: 'dashboard for the placement team' },
  { big: 'Zero', label: 'extra setup for students: same app, same login' },
];

export default function Institute() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const still = reducedMotion();
      gsap.fromTo(
        '[data-rail]',
        { scaleX: 0 },
        { scaleX: 1, duration: still ? 0 : 1.8, delay: still ? 0 : 0.8, ease: 'power2.inOut', transformOrigin: 'left center' },
      );
      gsap.fromTo(
        '[data-step]',
        { y: 26, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: still ? 0 : 0.8, delay: still ? 0 : 0.8, stagger: 0.32, ease: 'expo.out' },
      );
    },
    { scope: root },
  );

  return (
    <SlideFrame
      eyebrow="For colleges"
      title={
        <>
          How <span className="text-gradient">colleges</span> use Pass98.
        </>
      }
      subtitle="Your placement team prepares the whole batch, and knows who is ready before companies arrive."
    >
      <div ref={root} className="grid h-full content-center gap-8">
        <div className="relative">
          <div className="absolute left-[10%] right-[10%] top-7 hidden h-px bg-white/10 md:block" />
          <div data-rail className="absolute left-[10%] right-[10%] top-7 hidden h-px bg-gradient-to-r from-brand to-brand-deep shadow-[0_0_14px_rgb(254_102_0)] md:block" />
          <ol className="relative grid gap-5 md:grid-cols-5 md:gap-3">
            {FLOW.map((f) => (
              <li key={f.title} data-step className="flex gap-4 md:flex-col md:items-center md:text-center">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl border border-brand/50 bg-bg text-brand shadow-[0_0_28px_-6px_rgb(254_102_0/0.7)]">
                  <f.icon className="size-6" />
                </span>
                <div>
                  <p className="font-semibold tracking-tight">{f.title}</p>
                  <p className="mt-1 text-[0.82rem] leading-snug text-dim">{f.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div data-in className="grid gap-3 sm:grid-cols-3">
          {WINS.map((w, i) => (
            <Glass key={w.big} hot={i === 0} className="p-5">
              <p className="text-4xl font-bold tracking-tighter">{w.big}</p>
              <p className="mt-1 text-sm text-dim">{w.label}</p>
            </Glass>
          ))}
        </div>
      </div>
    </SlideFrame>
  );
}
