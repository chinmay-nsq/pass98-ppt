'use client';

import { useRef } from 'react';
import { Flame, Medal } from 'lucide-react';
import { SlideFrame } from '@/components/ui/SlideFrame';
import { Glass, Chip } from '@/components/ui/Glass';
import { cn } from '@/lib/cn';
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap';

// Sector constellation: x/y in a 0-100 box. `done` nodes glow, `boss` is the weekly Hard problem.
const NODES = [
  { id: 'Arrays', x: 10, y: 62, done: true },
  { id: 'Strings', x: 26, y: 30, done: true },
  { id: 'Hashing', x: 30, y: 78, done: true },
  { id: 'Sorting', x: 48, y: 52, done: true },
  { id: 'Trees', x: 62, y: 20, done: false },
  { id: 'Graphs', x: 70, y: 70, done: false },
  { id: 'DP', x: 88, y: 40, done: false, boss: true },
];
const EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
  [3, 4],
  [3, 5],
  [4, 6],
  [5, 6],
];

const BADGES = [
  'Liftoff',
  'In Orbit',
  'Deep Space',
  'Interstellar',
  'Warm Engines',
  'Hyperdrive',
  'Light Speed',
  'Heavy Lifter',
  'Sharpshooter',
  'Polyglot',
  'Sector Specialist',
];
const LANGS = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C', 'C#', 'Go', 'PHP'];

export default function Challenges() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const still = reducedMotion();
      // Each edge grows from its first node to its second by moving the line's end point.
      const edges = gsap.utils.toArray<SVGLineElement>('[data-edge]');
      edges.forEach((e, i) => {
        gsap.fromTo(
          e,
          { attr: { x2: Number(e.getAttribute('x1')), y2: Number(e.getAttribute('y1')) } },
          {
            attr: { x2: Number(e.getAttribute('data-x2')), y2: Number(e.getAttribute('data-y2')) },
            duration: still ? 0 : 0.9,
            delay: still ? 0 : 0.9 + i * 0.12,
            ease: 'power2.inOut',
          },
        );
      });
      gsap.fromTo(
        '[data-node]',
        { scale: 0, transformOrigin: '50% 50%' },
        { scale: 1, duration: still ? 0 : 0.7, delay: still ? 0 : 0.8, stagger: 0.1, ease: 'back.out(2.4)' },
      );
      gsap.fromTo(
        '[data-badge]',
        { opacity: 0.25 },
        { opacity: 1, duration: still ? 0 : 0.4, delay: still ? 0 : 2, stagger: 0.14 },
      );
      if (!still) {
        gsap.to('[data-boss]', { scale: 1.35, opacity: 0.2, duration: 1.2, repeat: -1, ease: 'power1.out', transformOrigin: '50% 50%' });
      }
    },
    { scope: root },
  );

  return (
    <SlideFrame
      eyebrow="Coding challenges"
      title={
        <>
          Practice that feels like a <span className="text-gradient">mission</span>.
        </>
      }
    >
      <div ref={root} className="grid h-full items-center gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        {/* Constellation */}
        <Glass data-in="left" className="relative aspect-[16/10] w-full overflow-hidden p-2">
          {/* The SVG and the node layer share the same inset box, so percentages line up exactly. */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-6 size-[calc(100%-3rem)]">
            {EDGES.map(([a, b], i) => (
              <line
                key={i}
                data-edge
                x1={NODES[a].x}
                y1={NODES[a].y}
                x2={NODES[b].x}
                y2={NODES[b].y}
                data-x2={NODES[b].x}
                data-y2={NODES[b].y}
                stroke={NODES[a].done && NODES[b].done ? '#fe6600' : 'rgb(255 255 255 / 0.22)'}
                vectorEffect="non-scaling-stroke"
                strokeWidth="1.6"
              />
            ))}
          </svg>
          <div className="absolute inset-6">
            <div className="relative size-full">
              {NODES.map((n) => (
                <div
                  key={n.id}
                  data-node
                  className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
                  style={{ left: `${n.x}%`, top: `${n.y}%` }}
                >
                  <div className="relative mx-auto grid size-[clamp(1.9rem,3.4vw,2.8rem)] place-items-center">
                    {n.boss && <span data-boss className="absolute inset-0 rounded-full border-2 border-rose" />}
                    <span
                      className={cn(
                        'relative grid size-full place-items-center rounded-full border text-[0.6rem] font-bold',
                        n.boss && 'border-rose bg-rose/20 text-rose',
                        !n.boss && n.done && 'border-brand bg-brand text-white shadow-[0_0_24px_rgb(254_102_0/0.8)]',
                        !n.boss && !n.done && 'border-white/25 bg-bg text-faint',
                      )}
                    >
                      {n.boss ? 'BOSS' : n.done ? '✓' : ''}
                    </span>
                  </div>
                  <p className="mono mt-1.5 text-[0.62rem] tracking-wide text-dim">{n.id}</p>
                </div>
              ))}
            </div>
          </div>
        </Glass>

        {/* Right column */}
        <div className="grid gap-4">
          <div data-in="right" className="grid grid-cols-2 gap-3">
            <Glass hot className="p-4">
              <p className="flex items-center gap-2 text-sm text-dim">
                <Flame className="size-4 text-brand" /> Streak
              </p>
              <p className="tabular mt-1 text-3xl font-bold tracking-tight">12 days</p>
              <div className="mt-2 flex gap-1">
                {[1, 1, 1, 1, 1, 1, 0].map((d, i) => (
                  <span key={i} className={cn('h-1.5 flex-1 rounded-full', d ? 'bg-brand' : 'bg-white/15')} />
                ))}
              </div>
            </Glass>
            <Glass className="p-4">
              <p className="text-sm text-dim">Today’s mission</p>
              <p className="mt-1 text-lg font-semibold leading-tight tracking-tight">Daily pick, same for everyone</p>
              <p className="mono mt-2 text-[0.68rem] text-rose">+ WEEKLY BOSS EVERY MONDAY</p>
            </Glass>
          </div>

          <Glass data-in="right" className="p-4">
            <p className="mb-3 flex items-center gap-2 text-sm text-dim">
              <Medal className="size-4 text-brand" /> 11 badges, derived from your solves
            </p>
            <div className="flex flex-wrap gap-1.5">
              {BADGES.map((b) => (
                <span key={b} data-badge className="rounded-full border border-brand/35 bg-brand/10 px-2.5 py-1 text-[0.7rem] font-medium text-brand-soft">
                  {b}
                </span>
              ))}
            </div>
          </Glass>

          <div data-in="right" className="flex flex-wrap gap-1.5">
            {LANGS.map((l) => (
              <Chip key={l}>{l}</Chip>
            ))}
          </div>
          <p data-in="fade" className="mono text-[0.68rem] tracking-widest text-faint">
            MONACO EDITOR · JUDGE0 SANDBOX · AI CODE REVIEW
          </p>
        </div>
      </div>
    </SlideFrame>
  );
}
