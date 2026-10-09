'use client';

import { SlideFrame } from '@/components/ui/SlideFrame';
import { Glass } from '@/components/ui/Glass';

const CHOICES = [
  {
    big: '77%',
    title: 'less output per report',
    body: 'Models used to echo the transcript back. Now they return turn numbers and the server fills in the text, which also ends invented Q&A.',
  },
  {
    big: '1',
    title: 'transaction at sign-up',
    body: 'The user, candidate, free trial and referral are written together or not at all, so self-referral cannot happen.',
  },
  {
    big: '0',
    title: 'lost recordings',
    body: 'Practice English audio is saved on the device before it uploads, so a dropped connection never costs an answer.',
  },
  {
    big: '24h',
    title: 'audio buffer, then gone',
    body: 'Spoken-English recordings are reachable for a day by their owner or an admin, with consent captured first and withdrawal built in.',
  },
];

export default function Choices() {
  return (
    <SlideFrame
      eyebrow="Engineering"
      title={
        <>
          Small decisions, <span className="text-gradient">big</span> leverage.
        </>
      }
    >
      <div className="grid h-full content-center gap-3 sm:grid-cols-2">
        {/* No CSS transition on these cards: SlideFrame animates them with GSAP and the two would fight. */}
        {CHOICES.map((c, i) => (
          <Glass key={c.title} hot={i === 0} data-in="up" className="p-[clamp(1rem,1.7vw,1.5rem)]">
            <p className="text-gradient text-[clamp(2.3rem,4.4vw,3.7rem)] font-bold leading-none tracking-tighter">{c.big}</p>
            <p className="mt-2.5 text-[1.05rem] font-semibold tracking-tight">{c.title}</p>
            <p className="mt-1 max-w-[48ch] text-[0.88rem] leading-relaxed text-dim">{c.body}</p>
          </Glass>
        ))}
      </div>
    </SlideFrame>
  );
}
