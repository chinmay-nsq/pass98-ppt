'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Rocket, Sparkles, Wand2, type LucideIcon } from 'lucide-react';
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
    label: 'Job role',
    title: 'Describe the job role',
    body: 'Paste a job description, dictate it, or pick a template. AI turns it into a role, a level and a skill list.',
    chips: ['Paste', 'Dictate', 'Template'],
  },
  {
    icon: FileText,
    label: 'Your CV',
    title: 'Add your CV, or build one',
    body: 'Upload your CV as a PDF or Word file. No CV yet? Build one right here with the resume builder.',
    chips: ['Upload PDF or Word', 'Build one', 'Six templates'],
  },
  {
    icon: Sparkles,
    label: 'Questions',
    title: 'Your questions, written for you',
    body: 'We combine your CV with the job description and write the questions. About 70% come from the job, about 30% from your CV.',
    chips: ['~70% from the job', '~30% from your CV'],
  },
  {
    icon: Rocket,
    label: 'Start',
    title: 'Pick a time and start',
    body: 'Choose how long you want to practise. A short countdown, then Anna says hello and the interview begins.',
    chips: ['15 min', '30 min', '45 min', '60 min'],
  },
];

export default function Preflight({ step }: SlideProps) {
  const active = step;
  const node = NODES[active];

  return (
    <SlideFrame
      eyebrow="Getting started"
      title={
        <>
          Your first interview in <span className="text-gradient">4 steps</span>.
        </>
      }
    >
      <div className="grid h-full content-center gap-8">
        {/* Stepper */}
        <div data-in className="relative mx-auto w-full max-w-4xl">
          <div className="absolute left-[12.5%] right-[12.5%] top-6 h-px bg-white/12" />
          <motion.div
            className="absolute left-[12.5%] top-6 h-px origin-left bg-gradient-to-r from-brand to-brand-deep shadow-[0_0_14px_rgb(254_102_0)]"
            style={{ width: '75%' }}
            animate={{ scaleX: active / (NODES.length - 1) }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
          <ol className="relative grid grid-cols-4">
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
