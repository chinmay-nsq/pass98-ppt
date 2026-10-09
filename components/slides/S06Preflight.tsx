'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Gauge, Mic, Rocket, Sparkles, Wand2, type LucideIcon } from 'lucide-react';
import { SlideFrame } from '@/components/ui/SlideFrame';
import { Glass, Chip } from '@/components/ui/Glass';
import { cn } from '@/lib/cn';
import type { SlideProps } from './types';

interface Node {
  icon: LucideIcon;
  label: string;
  title: string;
  body: string;
  chips: string[];
}

const NODES: Node[] = [
  {
    icon: Wand2,
    label: 'Role',
    title: 'Describe the role',
    body: 'Paste a job description, dictate it, or pick a template. AI turns it into a role, a level and a skill list.',
    chips: ['Paste', 'Dictate', 'Template'],
  },
  {
    icon: Sparkles,
    label: 'Questions',
    title: 'Questions are written for you',
    body: 'Sized to the session length. About 70% come from the role’s skills, about 30% from your own resume.',
    chips: ['~70% skills & JD', '~30% your resume', 'must-have vs nice-to-have'],
  },
  {
    icon: Mic,
    label: 'Devices',
    title: 'Check your camera and mic',
    body: 'A live level meter proves the microphone works before the clock starts.',
    chips: ['Camera', 'Microphone', 'Live level meter'],
  },
  {
    icon: Gauge,
    label: 'Network',
    title: 'Test the connection',
    body: 'Round-trip time, jitter and packet loss return a plain verdict, so a bad network never wastes a session.',
    chips: ['GOOD', 'WARN', 'BLOCK'],
  },
  {
    icon: Rocket,
    label: 'Launch',
    title: 'Five seconds to go',
    body: 'A countdown, then Anna says hello and the interview begins. Pick 15, 30, 45 or 60 minutes.',
    chips: ['15 min', '30 min', '45 min', '60 min'],
  },
];

export default function Preflight({ step }: SlideProps) {
  const active = step;
  const node = NODES[active];

  return (
    <SlideFrame
      eyebrow="Before the call"
      title={
        <>
          From a job post to a <span className="text-gradient">live call</span> in minutes.
        </>
      }
    >
      <div className="grid h-full content-center gap-8">
        {/* Stepper */}
        <div data-in className="relative mx-auto w-full max-w-4xl">
          <div className="absolute left-[10%] right-[10%] top-6 h-px bg-white/12" />
          <motion.div
            className="absolute left-[10%] top-6 h-px origin-left bg-gradient-to-r from-brand to-brand-deep shadow-[0_0_14px_rgb(254_102_0)]"
            style={{ width: '80%' }}
            animate={{ scaleX: active / (NODES.length - 1) }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
          <ol className="relative grid grid-cols-5">
            {NODES.map((n, i) => (
              <li key={n.label} className="flex flex-col items-center gap-2.5">
                <motion.span
                  animate={{ scale: i === active ? 1.18 : 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className={cn(
                    'grid size-12 place-items-center rounded-full border transition-colors duration-500',
                    i < active && 'border-brand/50 bg-brand/20 text-brand',
                    i === active && 'border-brand bg-brand text-white shadow-[0_0_34px_rgb(254_102_0/0.8)]',
                    i > active && 'border-white/12 bg-bg text-faint',
                  )}
                >
                  <n.icon className="size-5" />
                </motion.span>
                <span className={cn('text-xs font-medium transition-colors', i <= active ? 'text-ink' : 'text-faint')}>
                  {n.label}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Detail card */}
        <div data-in="up" className="mx-auto w-full max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Glass hot className="p-[clamp(1.25rem,2.6vw,2.25rem)]">
                <p className="mono mb-2 text-xs text-brand-soft">
                  STEP {active + 1} OF {NODES.length}
                </p>
                <h3 className="text-[clamp(1.4rem,2.4vw,2.1rem)] font-semibold leading-tight tracking-tight">{node.title}</h3>
                <p className="mt-3 max-w-[56ch] text-[clamp(0.95rem,1.25vw,1.12rem)] leading-relaxed text-dim">{node.body}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {node.chips.map((c) => (
                    <Chip key={c} tone="brand">
                      {c}
                    </Chip>
                  ))}
                </div>
              </Glass>
            </motion.div>
          </AnimatePresence>
          <p className="mono mt-4 text-center text-[0.7rem] tracking-widest text-faint">PRESS → TO MOVE THROUGH THE STEPS</p>
        </div>
      </div>
    </SlideFrame>
  );
}
