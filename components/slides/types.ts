import type { ComponentType } from 'react';

export interface SlideProps {
  /** In-slide build step: 0 on arrival, up to `steps` as the presenter advances. */
  step: number;
  /** Advances the deck by one build or slide, for slides that react to a click. */
  next?: () => void;
}

export type MascotMood = 'idle' | 'cheer' | 'think';

export interface MascotConfig {
  /** Which edge of the screen the character stands on. */
  side: 'left' | 'right';
  mood?: MascotMood;
  /** A short line shown in a speech bubble above the character. */
  say?: string;
  size?: 'md' | 'lg';
}

/** What lives behind and beside a slide, besides the slide itself. */
export interface Stage {
  /**
   * Where the wireframe core rests, in world units (x, y). Leave it out for no core. It is used
   * sparingly (three slides) so it stays a surprise instead of wallpaper.
   */
  core?: [number, number];
  /** The Pass98 mascot, the same 3D character as the product dashboard. */
  mascot?: MascotConfig;
}

export interface SlideDef {
  id: string;
  /** Short title shown in the overview grid. */
  title: string;
  /** Section label shown top-right and used to group the overview. */
  section: string;
  /** Number of extra builds before the deck moves to the next slide. */
  steps?: number;
  /** Speaker notes (press N). */
  notes: string;
  stage?: Stage;
  Component: ComponentType<SlideProps>;
}
