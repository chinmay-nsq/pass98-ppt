'use client';

import { useRef } from 'react';
import { gsap, useGSAP, reducedMotion } from '@/lib/gsap';

/** Counts from 0 to `to` when it mounts. Respects reduced motion. */
export function Counter({
  to,
  duration = 1.8,
  delay = 0.3,
  suffix = '',
  prefix = '',
  className,
}: {
  to: number;
  duration?: number;
  delay?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion()) {
      el.textContent = `${prefix}${to.toLocaleString('en-US')}${suffix}`;
      return;
    }
    const state = { v: 0 };
    gsap.to(state, {
      v: to,
      duration,
      delay,
      ease: 'power3.out',
      onUpdate: () => {
        el.textContent = `${prefix}${Math.round(state.v).toLocaleString('en-US')}${suffix}`;
      },
    });
  });

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
