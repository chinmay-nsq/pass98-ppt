import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

/** A frosted card. `hot` adds the orange glow used for the one card a slide wants you to look at. */
export function Glass({
  hot = false,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { hot?: boolean }) {
  return (
    <div
      className={cn(hot ? 'glass-hot' : 'glass', 'rounded-3xl', className)}
      {...rest}
    />
  );
}

export function Chip({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'brand' | 'mint' | 'sky' | 'amber';
  className?: string;
}) {
  const tones = {
    neutral: 'border-white/10 bg-white/[0.04] text-dim',
    brand: 'border-brand/40 bg-brand/10 text-brand-soft',
    mint: 'border-mint/35 bg-mint/10 text-mint',
    sky: 'border-sky/35 bg-sky/10 text-sky',
    amber: 'border-amber/35 bg-amber/10 text-amber',
  } as const;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.78rem] font-medium tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
