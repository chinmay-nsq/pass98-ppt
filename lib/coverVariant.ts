'use client';

import { useEffect, useState } from 'react';

/**
 * Which version of the deck is on: "classic" (no character), or one of the Orange Scout versions,
 * where he turns "Passionate" into "Pass98" on the cover and makes cameos on a few slides:
 * "push" (pushes "ionate" away), "stomp" (lands on it from above) or "kick" (a flying kick).
 * "push" is the default. There is no on-screen switch; press C on the cover to cycle through the
 * versions (remembered per device).
 */
export const COVER_VARIANTS = ['classic', 'push', 'stomp', 'kick'] as const;
export type CoverVariant = (typeof COVER_VARIANTS)[number];
export type ScoutMove = Exclude<CoverVariant, 'classic'>;

const STORE = 'pass98-cover-v2'; // v2: Push became the default, so older saved choices are ignored
const EVENT = 'pass98-cover-change';

export function readCoverVariant(): CoverVariant {
  try {
    const v = localStorage.getItem(STORE);
    return (COVER_VARIANTS as readonly string[]).includes(v ?? '') ? (v as CoverVariant) : 'push';
  } catch {
    return 'push';
  }
}

export function writeCoverVariant(v: CoverVariant) {
  try {
    localStorage.setItem(STORE, v);
  } catch {}
  window.dispatchEvent(new CustomEvent(EVENT, { detail: v }));
}

/** The current variant, kept in sync across components. Starts as "push" until mounted. */
export function useCoverVariant(): CoverVariant {
  const [v, setV] = useState<CoverVariant>('push');
  useEffect(() => {
    setV(readCoverVariant());
    const on = (e: Event) => setV((e as CustomEvent<CoverVariant>).detail);
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  return v;
}
