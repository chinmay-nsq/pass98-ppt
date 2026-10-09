'use client';

import { useRef, type ReactNode } from 'react';
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
 * Every slide sits inside a SlideFrame. It owns the entrance choreography:
 *  - the `[data-split]` heading is split into masked lines and its words rise into place;
 *  - every `[data-in]` element then eases in with a stagger (the attribute value picks the
 *    direction: up | left | right | zoom | fade).
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
        const split = SplitText.create(heading, { type: 'lines,words', mask: 'lines' });
        // `background-clip: text` is lost when the clipped text is wrapped in transformed child
        // boxes, so every word that sits inside a gradient span carries the gradient itself.
        split.words.forEach((w) => {
          if ((w as HTMLElement).closest('.text-gradient')) w.classList.add('tg-word');
        });
        tl.from(split.words, { yPercent: 118, duration: 1.1, stagger: 0.05 }, 0);
      }

      items.forEach((node, i) => {
        const v = (node.getAttribute('data-in') || 'up') as Variant;
        const delay = Number(node.getAttribute('data-delay') || 0);
        tl.fromTo(
          node,
          { opacity: 0, filter: 'blur(10px)', ...(FROM[v] ?? FROM.up) },
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.95,
            clearProps: 'filter',
          },
          0.18 + i * 0.065 + delay,
        );
      });
    },
    { scope: root },
  );

  const hasHeader = eyebrow || title || subtitle;

  return (
    <div
      ref={root}
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
