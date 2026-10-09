'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { SLIDES } from '@/components/slides';
import { DeckChrome } from './DeckChrome';
import { Overview } from './Overview';
import { NotesPanel, HelpPanel } from './Panels';

// three.js stays out of the first paint; the deck is fully usable before the canvas arrives.
const Backdrop = dynamic(() => import('./Backdrop'), { ssr: false });
const MascotLayer = dynamic(() => import('./MascotLayer'), { ssr: false });

const variants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 70, scale: 0.985, filter: 'blur(14px)' }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -70,
    scale: 1.012,
    filter: 'blur(14px)',
    transition: { duration: 0.32, ease: [0.4, 0, 1, 1] },
  }),
};

const total = SLIDES.length;

export function Deck() {
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [ready, setReady] = useState(false);
  const [overview, setOverview] = useState(false);
  const [notes, setNotes] = useState(false);
  const [help, setHelp] = useState(false);
  const [calm, setCalm] = useState(false);

  // Latest values for the event handlers below, so they never need re-binding.
  const state = useRef({ index, step });
  state.current = { index, step };
  const lock = useRef(0);

  const goTo = useCallback((target: number, toEnd = false) => {
    const clamped = Math.max(0, Math.min(total - 1, target));
    if (clamped === state.current.index) return;
    setDir(clamped > state.current.index ? 1 : -1);
    setIndex(clamped);
    setStep(toEnd ? (SLIDES[clamped].steps ?? 0) : 0);
  }, []);

  const next = useCallback(() => {
    const { index: i, step: s } = state.current;
    if (s < (SLIDES[i].steps ?? 0)) setStep(s + 1);
    else goTo(i + 1);
  }, [goTo]);

  const prev = useCallback(() => {
    const { index: i, step: s } = state.current;
    if (s > 0) setStep(s - 1);
    else goTo(i - 1, true);
  }, [goTo]);

  // First paint: read the slide number from the URL hash (#7) and honour reduced motion.
  useEffect(() => {
    const n = parseInt(window.location.hash.replace('#', ''), 10);
    if (Number.isFinite(n) && n >= 1 && n <= total) setIndex(n - 1);
    setCalm(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) window.history.replaceState(null, '', `#${index + 1}`);
  }, [index, ready]);

  // Typing a new #N into the address bar (or following a link to one) jumps to that slide.
  useEffect(() => {
    const onHash = () => {
      const n = parseInt(window.location.hash.replace('#', ''), 10);
      if (!Number.isFinite(n) || n < 1 || n > total || n - 1 === state.current.index) return;
      setDir(n - 1 > state.current.index ? 1 : -1);
      setIndex(n - 1);
      setStep(0);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
        case 'Enter':
          e.preventDefault();
          if (!overview) next();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'Backspace':
          e.preventDefault();
          if (!overview) prev();
          break;
        case 'Home':
          goTo(0);
          break;
        case 'End':
          goTo(total - 1);
          break;
        case 'o':
        case 'O':
          setOverview((v) => !v);
          break;
        case 'n':
        case 'N':
          setNotes((v) => !v);
          break;
        case '?':
          setHelp((v) => !v);
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'Escape':
          setOverview(false);
          setHelp(false);
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, goTo, overview]);

  // Wheel and swipe. A cooldown stops one trackpad flick from skipping several slides.
  useEffect(() => {
    let acc = 0;
    const onWheel = (e: WheelEvent) => {
      if (overview) return;
      const now = performance.now();
      if (now < lock.current) return;
      acc += e.deltaY + e.deltaX;
      if (Math.abs(acc) > 70) {
        acc > 0 ? next() : prev();
        acc = 0;
        lock.current = now + 900;
      }
    };
    let sx = 0;
    let sy = 0;
    const onStart = (e: TouchEvent) => {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
    };
    const onEnd = (e: TouchEvent) => {
      if (overview) return;
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.2) (dx < 0 ? next : prev)();
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
    };
  }, [next, prev, overview]);

  const slide = SLIDES[index];
  const Slide = slide.Component;

  return (
    <div className="fixed inset-0 overflow-hidden bg-bg text-ink">
      <Backdrop scene={index} core={slide.stage?.core ?? null} calm={calm} />
      <div className="vignette pointer-events-none absolute inset-0" />

      <AnimatePresence mode="wait" custom={dir}>
        {ready && (
          <motion.main
            key={slide.id}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 overflow-y-auto overflow-x-hidden"
          >
            <Slide step={step} next={next} />
          </motion.main>
        )}
      </AnimatePresence>

      {/* The mascot stands above the slide but below the controls, and leaves with its slide. */}
      <AnimatePresence>
        {ready && !calm && slide.stage?.mascot && <MascotLayer key={slide.id} config={slide.stage.mascot} />}
      </AnimatePresence>

      <div className="grain pointer-events-none absolute inset-0" />

      <DeckChrome
        index={index}
        total={total}
        section={slide.section}
        step={step}
        steps={slide.steps ?? 0}
        onPrev={prev}
        onNext={next}
        onJump={goTo}
        onOverview={() => setOverview(true)}
        onNotes={() => setNotes((v) => !v)}
        onHelp={() => setHelp(true)}
        onFullscreen={toggleFullscreen}
      />

      <AnimatePresence>
        {overview && (
          <Overview
            key="overview"
            current={index}
            onPick={(i) => {
              setOverview(false);
              goTo(i);
            }}
            onClose={() => setOverview(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>{notes && <NotesPanel key="notes" text={slide.notes} />}</AnimatePresence>
      <AnimatePresence>{help && <HelpPanel key="help" onClose={() => setHelp(false)} />}</AnimatePresence>
    </div>
  );
}

function toggleFullscreen() {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void document.documentElement.requestFullscreen?.();
}
