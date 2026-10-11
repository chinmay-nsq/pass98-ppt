'use client';

import { createContext, useContext, useRef, type ReactNode } from 'react';
import { gsap, SplitText, useGSAP, reducedMotion } from '@/lib/gsap';
import { cn } from '@/lib/cn';

type Variant = 'up' | 'left' | 'right' | 'zoom' | 'fade';

const FROM: Record<Variant, gsap.TweenVars> = {
  up: { y: 34, scale: 0.98 },
  left: { x: -48 },
  right: { x: 48 },
  zoom: { scale: 0.82 },
  fade: {},
};

/**
 * The slide's position in the deck, provided by Deck. SlideFrame uses it to pick one of three
 * entrance styles, rotating them so the same entrance never plays on two slides within three.
 */
export const SlideIndexContext = createContext(0);

/** The three entrance styles, in rotation order. */
export const ENTRANCES = ['rise', 'flip', 'focus'] as const;
type Entrance = (typeof ENTRANCES)[number];

// `background-clip: text` is lost when the clipped text is wrapped in transformed child boxes, so
// every split piece that sits inside a gradient span carries the gradient itself.
const keepGradient = (pieces: Element[]) =>
  pieces.forEach((p) => {
    if ((p as HTMLElement).closest('.text-gradient')) p.classList.add('tg-word');
  });

/** Animates the headline in, in the given style. */
function headingIn(tl: gsap.core.Timeline, heading: HTMLElement, style: Entrance) {
  if (style === 'flip') {
    // Letters flip up on their baseline, one after another.
    const split = SplitText.create(heading, { type: 'words,chars' });
    keepGradient(split.chars);
    gsap.set(heading, { perspective: 700 });
    tl.from(
      split.chars,
      {
        opacity: 0,
        rotationX: -100,
        yPercent: 45,
        transformOrigin: '50% 100% -12px',
        duration: 0.85,
        stagger: 0.016,
        ease: 'back.out(1.7)',
      },
      0,
    );
    return;
  }
  if (style === 'focus') {
    // Words snap into focus out of a blur, in random order.
    const split = SplitText.create(heading, { type: 'words' });
    keepGradient(split.words);
    tl.from(
      split.words,
      {
        opacity: 0,
        scale: 1.35,
        filter: 'blur(16px)',
        duration: 0.9,
        ease: 'power3.out',
        stagger: { amount: 0.45, from: 'random' },
        clearProps: 'filter',
      },
      0,
    );
    return;
  }
  // Rise: words come up from behind a mask, line by line.
  const split = SplitText.create(heading, { type: 'lines,words', mask: 'lines' });
  keepGradient(split.words);
  tl.from(split.words, { yPercent: 118, duration: 1.1, stagger: 0.05 }, 0);
}

/** Animates one `[data-in]` element in, in the given style. */
function itemIn(tl: gsap.core.Timeline, node: HTMLElement, i: number, style: Entrance) {
  const v = (node.getAttribute('data-in') || 'up') as Variant;
  const delay = Number(node.getAttribute('data-delay') || 0);

  // Plain fades (eyebrows, hints) fade in every style, so only the main elements change character.
  if (v === 'fade') {
    tl.fromTo(node, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 0.18 + i * 0.065 + delay);
    return;
  }

  if (style === 'flip') {
    // Wipe open from the top, settling down into place.
    tl.fromTo(
      node,
      { opacity: 0, y: -18, clipPath: 'inset(0% 0% 100% 0%)' },
      { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power4.out', clearProps: 'clipPath' },
      0.3 + i * 0.08 + delay,
    );
    return;
  }

  if (style === 'focus') {
    // Pop in with a little bounce.
    tl.fromTo(
      node,
      { opacity: 0, scale: 0.86, y: 18 },
      { opacity: 1, scale: 1, y: 0, duration: 0.75, ease: 'back.out(1.8)' },
      0.32 + i * 0.09 + delay,
    );
    return;
  }

  // Rise: ease in from the given direction out of a blur.
  tl.fromTo(
    node,
    { opacity: 0, filter: 'blur(10px)', ...(FROM[v] ?? FROM.up) },
    { opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.95, clearProps: 'filter' },
    0.18 + i * 0.065 + delay,
  );
}

/**
 * Every slide sits inside a SlideFrame. It owns the entrance choreography:
 *  - the `[data-split]` heading is split and animated in;
 *  - every `[data-in]` element then animates in with a stagger (the attribute value picks the
 *    direction for the "rise" style: up | left | right | zoom | fade).
 * The style rotates through rise → flip → focus by slide position (see SlideIndexContext).
 * Slides therefore only mark up what should animate; none of them repeat the timeline code.
 */
export function SlideFrame({
  eyebrow,
  title,
  subtitle,
  children,
  center = false,
  className,
  bodyClassName,
}: {
  eyebrow?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  center?: boolean;
  className?: string;
  bodyClassName?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const index = useContext(SlideIndexContext);
  const style = ENTRANCES[index % ENTRANCES.length];

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const heading = el.querySelector<HTMLElement>('[data-split]');
      const items = gsap.utils
        .toArray<HTMLElement>('[data-in]', el)
        .filter((n) => !n.hasAttribute('data-split'));

      if (reducedMotion()) {
        if (heading) gsap.set(heading, { opacity: 1 });
        gsap.set(items, { opacity: 1 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      if (heading) {
        gsap.set(heading, { opacity: 1 });
        headingIn(tl, heading, style);
      }
      items.forEach((node, i) => itemIn(tl, node, i, style));
    },
    { scope: root },
  );

  const hasHeader = eyebrow || title || subtitle;

  return (
    <div
      ref={root}
      data-entrance={style}
      className={cn(
        'relative mx-auto flex h-full w-full max-w-[1500px] flex-col px-[clamp(1.25rem,5vw,5rem)] pb-[clamp(5rem,9vh,7rem)] pt-[clamp(4.5rem,10vh,7rem)]',
        center && 'items-center text-center',
        className,
      )}
    >
      {hasHeader && (
        <header className={cn('mb-[clamp(1.25rem,3.4vh,2.75rem)] max-w-[62rem]', center && 'mx-auto')}>
          {eyebrow && (
            <p data-in="fade" className="eyebrow mb-4">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 data-split className="title-lg">
              {title}
            </h2>
          )}
          {subtitle && (
            <p data-in className={cn('lede mt-4', center && 'mx-auto')}>
              {subtitle}
            </p>
          )}
        </header>
      )}
      <div className={cn('relative min-h-0 flex-1', bodyClassName)}>{children}</div>
    </div>
  );
}
