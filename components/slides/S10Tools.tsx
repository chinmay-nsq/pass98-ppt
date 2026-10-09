'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Copy, Mail, ScrollText, Target } from 'lucide-react';
import { SlideFrame } from '@/components/ui/SlideFrame';
import { Glass } from '@/components/ui/Glass';
import { cn } from '@/lib/cn';

const VERSIONS = [
  {
    label: 'Original',
    text: 'Hi Priya, I saw the Frontend role at Acme and I would love to talk. I have built React dashboards for two years and shipped a design system used by twelve teams. Could we find fifteen minutes this week?',
  },
  {
    label: 'Shorter',
    text: 'Hi Priya, I am a React developer who built a design system used across twelve teams. Open to a fifteen-minute chat about the Frontend role at Acme?',
  },
  {
    label: 'Warmer tone',
    text: 'Hi Priya! Your Frontend role at Acme caught my eye. I have spent two years building React dashboards and a shared design system, and I would really enjoy hearing about your team. Do you have fifteen minutes this week?',
  },
  {
    label: 'Stronger hook',
    text: 'Hi Priya, a design system that twelve teams actually use is hard to build. I built one, and I would like to bring that to Acme’s Frontend team. Fifteen minutes this week?',
  },
];

const TOOLS = [
  { icon: ScrollText, name: 'Cover letter', body: 'A tailored letter from your resume and the role' },
  { icon: Mail, name: 'Outreach', body: 'LinkedIn and email messages for recruiters' },
  { icon: Target, name: 'JD match', body: 'Matched and missing keywords, with a match rate' },
];

const CHIPS = ['Original', 'Shorter', 'Warmer tone', 'Stronger hook'];

export default function Tools() {
  const [i, setI] = useState(0);

  // Cycle through the drafts so the "versions" idea shows itself without a click.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % VERSIONS.length), 3600);
    return () => window.clearInterval(t);
  }, []);

  const v = VERSIONS[i];

  return (
    <SlideFrame
      eyebrow="AI career tools"
      title={
        <>
          Write once. <span className="text-gradient">Rewrite</span> until it lands.
        </>
      }
    >
      <div className="grid h-full items-center gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <ul className="grid gap-5">
          {TOOLS.map((t) => (
            <li key={t.name} data-in="left" className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-brand/40 bg-brand/10 text-brand">
                <t.icon className="size-5" />
              </span>
              <div>
                <p className="text-lg font-semibold tracking-tight">{t.name}</p>
                <p className="text-sm text-dim">{t.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <Glass data-in="right" className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] p-0.5 text-xs">
              <span className="rounded-full bg-brand px-3 py-1 font-semibold text-white">LinkedIn</span>
              <span className="px-3 py-1 text-dim">Email</span>
            </div>
            <span className="mono flex items-center gap-1.5 text-[0.7rem] text-dim">
              <Copy className="size-3.5" /> Copy
            </span>
          </div>

          {/* Paper */}
          <div className="p-4 sm:p-5">
            <div className="relative min-h-[11.5rem] rounded-xl bg-[#f7f2ec] p-5 text-[0.95rem] leading-relaxed text-neutral-800">
              <p key={i} className="animate-[fadein_.55s_ease]">
                {v.text}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-3.5">
            <div className="flex flex-wrap gap-1.5">
              {CHIPS.map((c, idx) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setI(idx)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition',
                    idx === i
                      ? 'border-brand bg-brand/20 text-ink shadow-[0_0_18px_-4px_rgb(254_102_0)]'
                      : 'border-white/10 text-dim hover:border-brand/40 hover:text-ink',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="mono flex items-center gap-2 text-[0.72rem] text-dim">
              <ChevronLeft className="size-4" />
              Version {i + 1} of {VERSIONS.length}
              <ChevronRight className="size-4" />
            </div>
          </div>
        </Glass>
      </div>
      <style>{`@keyframes fadein{from{opacity:0;transform:translateY(8px);filter:blur(5px)}to{opacity:1;transform:none;filter:none}}`}</style>
    </SlideFrame>
  );
}
