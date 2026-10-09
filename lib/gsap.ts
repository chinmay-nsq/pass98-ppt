'use client';

// One place that registers GSAP plugins, so slides import `gsap` from here and never worry
// about registration order. (All GSAP plugins, SplitText included, are free as of 3.13.)
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/SplitText';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(useGSAP, SplitText, MotionPathPlugin, CustomEase);

// A soft "overshoot-then-settle" curve used for card entrances.
CustomEase.create('settle', 'M0,0 C0.16,0.9 0.28,1.08 0.5,1.02 0.7,0.98 0.85,1 1,1');

export const reducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export { gsap, useGSAP, SplitText, MotionPathPlugin };
