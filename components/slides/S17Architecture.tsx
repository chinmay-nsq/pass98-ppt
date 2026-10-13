'use client';

import { useRef } from 'react';
import { ArrowRight, BrainCircuit, Database, Layout, Server, Smartphone, Wrench, type LucideIcon } from 'lucide-react';
import { SlideFrame } from '@/components/ui/SlideFrame';
import { Glass } from '@/components/ui/Glass';
import { cn } from '@/lib/cn';
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap';

/** The stack, grouped the way the product is built. Every name is in the two repos' package.json. */
const STACK: { icon: LucideIcon; group: string; tone: string; items: string[] }[] = [
  { icon: Layout, group: 'Web app', tone: 'text-sky', items: ['React 19', 'TypeScript', 'Vite', 'Tailwind CSS', 'Redux Toolkit', 'Three.js'] },
  { icon: Smartphone, group: 'Mobile', tone: 'text-sky', items: ['Capacitor', 'iOS', 'Android'] },
  { icon: Server, group: 'Backend', tone: 'text-brand', items: ['Node.js', 'Express', 'TypeScript', 'Zod', 'JWT auth'] },
  { icon: BrainCircuit, group: 'AI and voice', tone: 'text-amber', items: ['OpenAI', 'Deepgram', 'Cartesia', 'LiveKit'] },
  { icon: Database, group: 'Data', tone: 'text-mint', items: ['PostgreSQL', 'Prisma', 'Redis', 'AWS S3'] },
  { icon: Wrench, group: 'Services', tone: 'text-dim', items: ['Judge0', 'Razorpay', 'Monaco editor', 'Office 365 mail'] },
];

/** The architecture in one line: where a spoken answer goes. */
const FLOW = [
  { name: 'App', sub: 'Web, iOS, Android' },
  { name: 'API', sub: 'Login, plans, limits' },
  { name: 'AI and voice', sub: 'Hears, thinks, speaks' },
  { name: 'Database', sub: 'Reports and files' },
];

export default function Architecture() {
  const root = useRef<HTMLDivElement>(null);

  // A dot runs along the architecture strip, so it reads as data moving through the system.
  useGSAP(
    () => {
      if (reducedMotion()) return;
      gsap.fromTo('[data-pulse]', { left: '0%', opacity: 0 }, { left: '100%', opacity: 1, duration: 2.6, repeat: -1, ease: 'power1.inOut', delay: 1.4 });
    },
    { scope: root },
  );

  return (
    <SlideFrame
      eyebrow="Tech stack and architecture"
      title={
        <>
          What Pass98 is <span className="text-gradient">built with</span>.
        </>
      }
    >
      <div ref={root} className="grid h-full content-center gap-[clamp(1rem,2.4vh,1.75rem)]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STACK.map((s, i) => (
            <Glass key={s.group} data-in data-delay={String(0.15 + i * 0.06)} className="p-[clamp(0.9rem,1.4vw,1.25rem)]">
              <div className="flex items-center gap-2.5">
                <s.icon className={cn('size-5', s.tone)} />
                <p className={cn('mono text-[0.72rem] font-semibold uppercase tracking-[0.2em]', s.tone)}>{s.group}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {s.items.map((it) => (
                  <span key={it} className="rounded-lg border border-white/10 bg-white/[0.045] px-2.5 py-1 text-[0.82rem] font-medium tracking-tight">
                    {it}
                  </span>
                ))}
              </div>
            </Glass>
          ))}
        </div>

        <div data-in data-delay="0.6" className="relative">
          <div className="absolute left-[12%] right-[12%] top-1/2 hidden h-px bg-gradient-to-r from-sky/50 via-brand/60 to-mint/50 md:block">
            <span data-pulse className="absolute -top-[3px] size-[7px] -translate-x-1/2 rounded-full bg-brand opacity-0 shadow-[0_0_12px_#fe6600]" />
          </div>
          <ol className="relative grid grid-cols-2 gap-3 md:grid-cols-4">
            {FLOW.map((f, i) => (
              <li key={f.name} className="flex items-center justify-center gap-2">
                <div className="rounded-2xl border border-brand/40 bg-bg px-4 py-2.5 text-center shadow-[0_0_24px_-8px_rgb(254_102_0/0.6)]">
                  <p className="font-semibold tracking-tight">{f.name}</p>
                  <p className="text-[0.75rem] text-dim">{f.sub}</p>
                </div>
                {i < FLOW.length - 1 && <ArrowRight className="hidden size-4 shrink-0 text-brand/70 md:block" />}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </SlideFrame>
  );
}
