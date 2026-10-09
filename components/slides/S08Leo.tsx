'use client';

import { useEffect, useState } from 'react';
import { Bot, BrainCircuit, FileSearch, Radio } from 'lucide-react';
import { SlideFrame } from '@/components/ui/SlideFrame';
import { Glass, Chip } from '@/components/ui/Glass';

const QUESTION = 'Why did I only score 64 on system design?';
const ANSWER =
  'You named the right components, but skipped the trade-offs. In question 3 you added a cache without saying when it goes stale. Try explaining one design out loud in two minutes, naming one trade-off for every box you draw.';

const FACTS = [
  { icon: FileSearch, title: 'Reads your reports', body: 'Every answer is grounded in your real data.' },
  { icon: BrainCircuit, title: 'Remembers you', body: 'Long chats are summarised into lasting memory.' },
  { icon: Radio, title: 'Streams live', body: 'Replies arrive token by token, like a person typing.' },
];

type Phase = 'idle' | 'asking' | 'thinking' | 'answering' | 'done';

export default function Leo() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [asked, setAsked] = useState('');
  const [answered, setAnswered] = useState('');

  // A scripted conversation that plays once when the slide opens.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setAsked(QUESTION);
      setAnswered(ANSWER);
      setPhase('done');
      return;
    }
    const timers: number[] = [];
    let i = 0;
    let j = 0;
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    later(1300, () => {
      setPhase('asking');
      const t = window.setInterval(() => {
        i += 1;
        setAsked(QUESTION.slice(0, i));
        if (i >= QUESTION.length) {
          window.clearInterval(t);
          setPhase('thinking');
          later(900, () => {
            setPhase('answering');
            const a = window.setInterval(() => {
              j += 2;
              setAnswered(ANSWER.slice(0, j));
              if (j >= ANSWER.length) {
                window.clearInterval(a);
                setPhase('done');
              }
            }, 22);
            timers.push(a);
          });
        }
      }, 34);
      timers.push(t);
    });

    return () => {
      timers.forEach((t) => {
        window.clearTimeout(t);
        window.clearInterval(t);
      });
    };
  }, []);

  return (
    <SlideFrame
      eyebrow="Your coach"
      title={
        <>
          Leo knows <span className="text-gradient">your</span> interviews.
        </>
      }
      subtitle="A mentor that opens from any page, or from a single report, and answers from your actual results."
    >
      <div className="grid h-full items-center gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <ul className="grid gap-5">
          {FACTS.map((f) => (
            <li key={f.title} data-in="left" className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-brand/40 bg-brand/10 text-brand">
                <f.icon className="size-5" />
              </span>
              <div>
                <p className="text-lg font-semibold tracking-tight">{f.title}</p>
                <p className="text-sm text-dim">{f.body}</p>
              </div>
            </li>
          ))}
          <li data-in="left" className="flex flex-wrap gap-2 pt-1">
            <Chip>20 messages on trial</Chip>
            <Chip>200 on PRO</Chip>
            <Chip tone="brand">1,000 on MAX</Chip>
          </li>
        </ul>

        <Glass hot data-in="right" className="overflow-hidden">
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-3.5">
            <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-deep text-white">
              <Bot className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-none">Leo</p>
              <p className="mt-1 text-[0.7rem] text-mint">Scoped to your latest report</p>
            </div>
          </div>

          <div className="grid min-h-[17rem] content-start gap-3 p-5 text-[0.92rem] leading-relaxed">
            {asked && (
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-brand/18 px-4 py-2.5">{asked}</div>
            )}
            {phase === 'thinking' && (
              <div className="flex w-16 items-center justify-center gap-1 rounded-2xl rounded-tl-sm bg-white/[0.07] py-3">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="size-1.5 animate-bounce rounded-full bg-dim"
                    style={{ animationDelay: `${d * 140}ms` }}
                  />
                ))}
              </div>
            )}
            {answered && (
              <div className="max-w-[92%] rounded-2xl rounded-tl-sm bg-white/[0.07] px-4 py-3">
                {answered}
                {phase === 'answering' && <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-brand align-middle" />}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-3.5">
            <div className="flex items-center justify-between rounded-xl bg-white/[0.05] px-4 py-2.5 text-sm text-faint">
              Ask Leo anything…
              <span className="mono rounded-md border border-white/10 px-1.5 text-[0.65rem]">↵</span>
            </div>
          </div>
        </Glass>
      </div>
    </SlideFrame>
  );
}
