'use client';

import { Bot, Code2, FileText, Gauge, LayoutDashboard, Mic2, ScrollText, Target, type LucideIcon } from 'lucide-react';
import { SlideFrame } from '@/components/ui/SlideFrame';
import { Glass } from '@/components/ui/Glass';

/** Everything beyond the interview itself, one or two lines each. */
const FEATURES: { icon: LucideIcon; name: string; body: string }[] = [
  { icon: Bot, name: 'Leo, your mentor', body: 'Chat any time. He reads your reports and remembers you.' },
  { icon: FileText, name: 'Resume builder', body: 'Six templates, live preview, download as PDF or Word.' },
  { icon: Gauge, name: 'ATS score', body: 'See how your resume scores, and let AI improve it.' },
  { icon: Target, name: 'Job match', body: 'Paste a job post. See the keywords you have and the ones you miss.' },
  { icon: ScrollText, name: 'Cover letters', body: 'A letter written for the role, rewritten until it sounds like you.' },
  { icon: Mic2, name: 'Practice English', body: 'Speak, get a grade from A to D, and hear a better version of your answer.' },
  { icon: Code2, name: 'Coding missions', body: 'Problems in nine languages, with streaks, badges and an AI code review.' },
  { icon: LayoutDashboard, name: 'Your dashboard', body: 'Your top skills and every past interview, in one place.' },
];

export default function Features() {
  return (
    <SlideFrame
      eyebrow="And there is more"
      title={
        <>
          Everything else to <span className="text-gradient">get hired</span>.
        </>
      }
    >
      <div className="grid h-full content-center gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {FEATURES.map((f, i) => (
          <Glass key={f.name} data-in data-delay={String(0.2 + i * 0.06)} hot={i === 0} className="p-[clamp(1rem,1.6vw,1.5rem)]">
            <span className="grid size-11 place-items-center rounded-xl border border-brand/40 bg-brand/10 text-brand">
              <f.icon className="size-5" />
            </span>
            <p className="mt-4 text-[clamp(1rem,1.4vw,1.25rem)] font-semibold tracking-tight">{f.name}</p>
            <p className="mt-1.5 text-[clamp(0.82rem,1vw,0.95rem)] leading-snug text-dim">{f.body}</p>
          </Glass>
        ))}
      </div>
    </SlideFrame>
  );
}
