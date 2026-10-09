'use client';

import { useRef } from 'react';
import { Building2, GraduationCap, ShieldCheck, Users, type LucideIcon } from 'lucide-react';
import { SlideFrame } from '@/components/ui/SlideFrame';
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap';
import { asset } from '@/lib/asset';

interface Persona {
  name: string;
  role: string;
  line: string;
  icon: LucideIcon;
  // Position on the orbit, in degrees (0 = top, clockwise).
  angle: number;
}

const PERSONAS: Persona[] = [
  { name: 'Candidate', role: 'STUDENT', line: 'Practise, get scored, level up', icon: GraduationCap, angle: 0 },
  { name: 'Institute', role: 'INSTITUTE', line: 'Roster, assessments, reports', icon: Building2, angle: 90 },
  { name: 'Department admin', role: 'INSTITUTE_STAFF', line: 'Own department, same tools', icon: Users, angle: 180 },
  { name: 'Super admin', role: 'SUPER_ADMIN', line: 'Plans, coupons, support, audit', icon: ShieldCheck, angle: 270 },
];

export default function Personas() {
  const orbit = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.to('[data-ring-a]', { rotation: 360, duration: 70, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
      gsap.to('[data-ring-b]', { rotation: -360, duration: 110, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
      gsap.to('[data-spark]', { rotation: 360, duration: 14, repeat: -1, ease: 'none', transformOrigin: '50% 50%' });
      gsap.fromTo(
        '[data-node]',
        { scale: 0.4, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.1, stagger: 0.16, delay: 0.7, ease: 'settle' },
      );
    },
    { scope: orbit },
  );

  return (
    <SlideFrame
      eyebrow="One platform"
      title={
        <>
          Four people, <span className="text-gradient">one login</span>.
        </>
      }
      subtitle="Each role lands in its own workspace, with its own layout and permissions, on the same engine."
    >
      <div className="grid h-full items-center gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <ul data-in="left" className="hidden gap-4 lg:grid">
          {PERSONAS.map((p) => (
            <li key={p.name} className="flex items-start gap-4">
              <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl border border-brand/40 bg-brand/10 text-brand">
                <p.icon className="size-5" />
              </span>
              <div>
                <p className="text-lg font-semibold tracking-tight">{p.name}</p>
                <p className="text-sm text-dim">{p.line}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Sized by the smaller of the column, the viewport height and 34rem, so it never overflows. */}
        <div
          ref={orbit}
          data-in="zoom"
          className="relative mx-auto aspect-square"
          style={{ width: 'min(100%, 54vh, 34rem)' }}
        >
          {/* Rings */}
          <svg viewBox="0 0 400 400" className="absolute inset-0 size-full" aria-hidden>
            <g data-ring-a>
              <circle cx="200" cy="200" r="168" fill="none" stroke="rgb(254 102 0 / 0.45)" strokeWidth="1" strokeDasharray="2 9" />
            </g>
            <g data-ring-b>
              <circle cx="200" cy="200" r="128" fill="none" stroke="rgb(255 255 255 / 0.16)" strokeWidth="1" strokeDasharray="1 7" />
            </g>
            <circle cx="200" cy="200" r="84" fill="none" stroke="rgb(254 102 0 / 0.22)" strokeWidth="1" />
            <g data-spark>
              <circle cx="200" cy="32" r="4" fill="#fe6600" />
              <circle cx="200" cy="32" r="9" fill="#fe6600" opacity="0.25" />
            </g>
          </svg>

          {/* Core */}
          <div className="absolute left-1/2 top-1/2 grid size-[26%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full glass-hot">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset('/pass98-logo.png')} alt="Pass98" className="h-1/2 w-auto" />
          </div>

          {/* Nodes: positioned on a circle with percent maths so the whole thing scales. */}
          {PERSONAS.map((p) => {
            const rad = (p.angle * Math.PI) / 180;
            const left = 50 + Math.sin(rad) * 42;
            const top = 50 - Math.cos(rad) * 42;
            return (
              <div
                key={p.name}
                data-node
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <div className="glass flex items-center gap-2.5 whitespace-nowrap rounded-full py-2 pl-2 pr-4 transition-transform duration-300 hover:scale-110">
                  <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-deep text-white">
                    <p.icon className="size-4" />
                  </span>
                  <span className="text-[0.82rem] font-semibold tracking-tight">{p.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SlideFrame>
  );
}
