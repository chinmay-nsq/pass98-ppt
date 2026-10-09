'use client';

import { useRef } from 'react';
import { BarChart3, ClipboardList, FileSpreadsheet, FolderTree, Mic, type LucideIcon } from 'lucide-react';
import { SlideFrame } from '@/components/ui/SlideFrame';
import { Glass } from '@/components/ui/Glass';
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap';

const FLOW: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: FileSpreadsheet, title: 'Import the roster', body: 'CSV or XLSX, up to 2,000 rows, checked before anything is saved' },
  { icon: FolderTree, title: 'Organise', body: 'Departments, each with its own admins' },
  { icon: ClipboardList, title: 'Assign a test', body: 'A four-step wizard: role, who, timing, review' },
  { icon: Mic, title: 'Students interview', body: 'The same AI engine, unchanged' },
  { icon: BarChart3, title: 'Read the reports', body: 'Released when you decide' },
];

const TIERS = [
  { name: 'Enterprise trial', big: '10', unit: 'seats', sub: '20 assigned interviews · 14 days' },
  { name: 'Enterprise', big: '250', unit: 'seats', sub: '1,500 assigned interviews' },
  { name: 'Campus', big: '5,000', unit: 'interviews', sub: 'No seat cap, whole college' },
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
          The same engine, at <span className="text-gradient">campus scale</span>.
        </>
      }
      subtitle="Institutes reuse the interview and scoring pipeline completely unchanged. Nothing about the candidate product had to be rewritten."
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
          {TIERS.map((t, i) => (
            <Glass key={t.name} hot={i === 2} className="p-5">
              <p className="mono text-[0.68rem] tracking-widest text-faint">{t.name.toUpperCase()}</p>
              <p className="mt-2 text-4xl font-bold tracking-tighter">
                {t.big} <span className="text-base font-medium text-dim">{t.unit}</span>
              </p>
              <p className="mt-1 text-sm text-dim">{t.sub}</p>
            </Glass>
          ))}
        </div>
      </div>
    </SlideFrame>
  );
}
