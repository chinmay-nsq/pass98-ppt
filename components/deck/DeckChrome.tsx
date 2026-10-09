'use client';

import { ChevronLeft, ChevronRight, LayoutGrid, Maximize2, MessageSquareText, Keyboard } from 'lucide-react';
import { cn } from '@/lib/cn';
import { asset } from '@/lib/asset';

interface Props {
  index: number;
  total: number;
  section: string;
  step: number;
  steps: number;
  onPrev: () => void;
  onNext: () => void;
  onJump: (i: number) => void;
  onOverview: () => void;
  onNotes: () => void;
  onHelp: () => void;
  onFullscreen: () => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

function IconButton({
  label,
  onClick,
  children,
  className,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'grid size-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-dim backdrop-blur transition hover:border-brand/50 hover:bg-brand/10 hover:text-ink focus-visible:outline-2 focus-visible:outline-brand',
        className,
      )}
    >
      {children}
    </button>
  );
}

/** The thin, always-on frame around the slides: brand, position, progress and tools. */
export function DeckChrome({
  index,
  total,
  section,
  step,
  steps,
  onPrev,
  onNext,
  onJump,
  onOverview,
  onNotes,
  onHelp,
  onFullscreen,
}: Props) {
  return (
    <>
      {/* Top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-[clamp(1rem,3vw,2.5rem)] pt-5">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset('/pass98-logo.png')} alt="" className="h-7 w-auto" />
          <span className="text-[0.95rem] font-semibold tracking-tight">Pass98</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="eyebrow hidden sm:inline">{section}</span>
          <span className="mono tabular text-xs text-dim">
            {pad(index + 1)} <span className="text-faint">/ {pad(total)}</span>
          </span>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute inset-x-0 bottom-0 z-30 px-[clamp(1rem,3vw,2.5rem)] pb-5">
        <div className="mb-4 flex items-center gap-1">
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => onJump(i)}
              className="group relative h-4 flex-1 cursor-pointer"
            >
              <span
                className={cn(
                  'absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full transition-all duration-500 group-hover:h-[5px]',
                  i < index && 'bg-brand/70',
                  i === index && 'bg-brand shadow-[0_0_12px_rgb(254_102_0/0.9)]',
                  i > index && 'bg-white/12',
                )}
              />
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconButton label="Overview (O)" onClick={onOverview}>
              <LayoutGrid className="size-4" />
            </IconButton>
            <IconButton label="Speaker notes (N)" onClick={onNotes}>
              <MessageSquareText className="size-4" />
            </IconButton>
            <IconButton label="Keyboard help (?)" onClick={onHelp} className="hidden sm:grid">
              <Keyboard className="size-4" />
            </IconButton>
            <IconButton label="Fullscreen (F)" onClick={onFullscreen} className="hidden sm:grid">
              <Maximize2 className="size-4" />
            </IconButton>
          </div>

          <div className="flex items-center gap-3">
            {steps > 0 && (
              <div className="hidden items-center gap-1.5 sm:flex" aria-label="Build steps">
                {Array.from({ length: steps + 1 }, (_, i) => (
                  <span
                    key={i}
                    className={cn('size-1.5 rounded-full transition-colors', i <= step ? 'bg-brand' : 'bg-white/20')}
                  />
                ))}
              </div>
            )}
            <IconButton label="Previous (←)" onClick={onPrev}>
              <ChevronLeft className="size-4" />
            </IconButton>
            <IconButton label="Next (→)" onClick={onNext} className="border-brand/40 bg-brand/15 text-ink">
              <ChevronRight className="size-4" />
            </IconButton>
          </div>
        </div>
      </div>
    </>
  );
}
