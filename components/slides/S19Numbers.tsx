'use client';

import { SlideFrame } from '@/components/ui/SlideFrame';
import { Counter } from '@/components/ui/Counter';
import { NUMBERS } from '@/lib/data';

export default function Numbers() {
  return (
    <SlideFrame
      eyebrow="By the numbers"
      title={
        <>
          Counted from the <span className="text-gradient">code</span>, not the brochure.
        </>
      }
    >
      <div className="grid h-full content-center grid-cols-2 gap-x-6 gap-y-[clamp(1.5rem,5vh,3.5rem)] md:grid-cols-4">
        {NUMBERS.map((n, i) => (
          <div key={n.label} data-in className="border-l border-white/12 pl-5">
            <p className="tabular text-[clamp(2.8rem,6.4vw,5.6rem)] font-bold leading-none tracking-tighter">
              <Counter to={n.value} delay={0.5 + i * 0.1} className={i === 0 ? 'text-gradient' : undefined} />
            </p>
            <p className="mt-2 text-[0.9rem] leading-snug text-dim">{n.label}</p>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}
