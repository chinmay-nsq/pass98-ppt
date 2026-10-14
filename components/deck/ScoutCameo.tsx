'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from '@/lib/gsap';
import { ACTIONS, KEYS, LOOPS, P, TUCK, sampleAction, squat, type ActionName, type LoopName, type Pose } from '@/lib/scoutPose';
import { FEET_FRACTION, VIEW_H } from './ScoutStage';

const ScoutStage = dynamic(() => import('./ScoutStage'), { ssr: false });

/**
 * A place to stand. With `anchor`, it is a point on the element marked `data-cameo="<anchor>"`:
 * `x` across its width and `y` down its height (0 = its top edge), so he lands on it at any screen
 * size. Without one, `x` and `y` are fractions of the screen.
 */
export interface Spot {
  anchor?: string;
  x: number;
  y?: number;
}

/**
 * One step of a cameo routine.
 *  - `run`: run in from screen x `from` (a fraction, e.g. 1.08 = off the right edge) to a spot.
 *  - `hop`: jump from where he is to a spot (or in place), `height` model units above the higher of
 *    the two, twirling `spin` full turns (about the vertical axis) or doing `flip` front flips.
 *  - `act`: play one of the model's moves once.
 *  - `loop`: hold a looping move (idle, dance, look) for `dur` seconds, or forever if omitted.
 *  - `face`: turn to face a direction (radians: 0 = audience, -π/2 = screen-left).
 *  - `wait`: idle for `dur` seconds.
 *  - `emit`: tell the slide something happened (a `scout-cameo` window event with this name).
 */
export type CameoStep =
  | { run: { from: number; to: Spot; dur: number } }
  | { hop: { to?: Spot; dur: number; height?: number; spin?: number; flip?: number } }
  | { act: ActionName }
  | { loop: LoopName; dur?: number }
  | { face: number }
  | { wait: number }
  | { emit: string };

export interface CameoConfig {
  /** Where he stands before the first step (a run starts off-screen anyway). */
  spot: Spot;
  /** His height as a fraction of the screen height. */
  size: number;
  /** Seconds to stay hidden after the slide arrives, so it settles before he enters. */
  delay?: number;
  /** Stay hidden until the slide reaches this build step (a click), then start. */
  startAtStep?: number;
  /** Starting direction (radians); defaults to facing the audience. */
  facing?: number;
  /** The routine; the last step should normally be a `loop` without a duration. */
  steps: CameoStep[];
  /** After the routine, repeat this move every `every` seconds (e.g. a wave). */
  repeat?: { act: ActionName; every: number };
}

export const CAMEO_EVENT = 'scout-cameo';

const MODEL_H = 1.9; // model units from feet to the top of the crest

/**
 * The Orange Scout making a cameo on a slide. It runs a small script of moves (ported from the
 * model's own animation page): the pose eases toward each step's target every frame, exactly as the
 * original page does, and the canvas is moved for runs and hops.
 */
export default function ScoutCameo({ config, step = 0 }: { config: CameoConfig; step?: number }) {
  const pose = useRef<Pose>(P({ rootRot: config.facing ?? 0 })).current;
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number; ppu: number } | null>(null);
  const [ready, setReady] = useState(false);
  // Once the slide reaches `startAtStep` he starts, and stays started even if the step goes back.
  const started = useRef(false);
  if (step >= (config.startAtStep ?? 0)) started.current = true;

  // Size from the viewport once on mount.
  useEffect(() => {
    const ppu = (config.size * window.innerHeight) / MODEL_H;
    const h = Math.round(VIEW_H * ppu);
    setSize({ w: Math.round(h * 0.95), h, ppu });
  }, [config.size]);

  const onReady = useCallback(() => setReady(true), []);
  const onFail = useCallback(() => setReady(false), []);

  useEffect(() => {
    if (!ready || !size || !box.current) return;
    const el = box.current;
    const { w: W, h: H, ppu } = size;

    // Screen position (px) of a spot, read live so he follows the layout as slides animate in.
    const at = (s: Spot) => {
      const a = s.anchor ? document.querySelector<HTMLElement>(`[data-cameo="${s.anchor}"]`) : null;
      if (a) {
        const r = a.getBoundingClientRect();
        return { x: r.left + s.x * r.width, y: r.top + (s.y ?? 0) * r.height };
      }
      return { x: s.x * window.innerWidth, y: (s.y ?? 0) * window.innerHeight };
    };

    let spot: Spot = config.spot;
    let facing = config.facing ?? 0;
    let stepIndex = -1;
    let stepT = 0;
    let T = 0;
    let lastRepeat = 0;
    let repeatAct: { name: ActionName; t: number } | null = null;
    let faceFrom = 0;
    let hopFrom = { x: 0, y: 0 };
    let spinRot = 0;
    let flipRot = 0;
    // Where he is drawn this frame (px), when moving between spots.
    let moving: { x: number; y: number } | null = null;
    const cur: Pose = { ...pose };

    const place = () => {
      const p = moving ?? at(spot);
      gsap.set(el, { x: p.x - W / 2, y: p.y - FEET_FRACTION * H });
    };

    const next = () => {
      stepIndex++;
      stepT = 0;
      const s = config.steps[stepIndex];
      if (!s) return;
      if ('run' in s) facing = at(s.run.to).x < s.run.from * window.innerWidth ? -Math.PI / 2 : Math.PI / 2;
      if ('hop' in s) hopFrom = moving ?? at(spot);
      if ('face' in s) faceFrom = facing;
      if ('emit' in s) {
        window.dispatchEvent(new CustomEvent(CAMEO_EVENT, { detail: s.emit }));
        next();
      }
    };
    next();
    if (!config.delay && !config.startAtStep) place();

    let waitIn = config.delay ?? 0;
    const tick = () => {
      const dt = Math.min(0.05, gsap.ticker.deltaRatio() / 60);
      if (!started.current) return;
      if (waitIn > 0) {
        waitIn -= dt;
        return;
      }
      T += dt;
      stepT += dt;
      const s = config.steps[stepIndex];
      let target: Pose = LOOPS.idle(T);
      let fast = false;

      if (s) {
        if ('run' in s) {
          const p = Math.min(1, stepT / s.run.dur);
          const to = at(s.run.to);
          moving = { x: s.run.from * window.innerWidth + (to.x - s.run.from * window.innerWidth) * p, y: to.y };
          target = LOOPS.run(T);
          if (p >= 1) {
            spot = s.run.to;
            moving = null;
            next();
          }
        } else if ('hop' in s) {
          const p = Math.min(1, stepT / s.hop.dur);
          const dest = s.hop.to ?? spot;
          const to = at(dest);
          const e = p * p * (3 - 2 * p);
          const lift = (s.hop.height ?? 0.8) * ppu + Math.max(0, hopFrom.y - to.y);
          moving = {
            x: hopFrom.x + (to.x - hopFrom.x) * e,
            y: hopFrom.y + (to.y - hopFrom.y) * p - Math.sin(Math.PI * p) * lift,
          };
          // Crouch, tuck in the air, then legs down for the landing.
          target = p < 0.15 ? P(squat(0.8), { aLx: 0.6, aRx: 0.6 }) : p < 0.75 ? { ...TUCK, rootRot: 0 } : P({ aLz: 1.2, aRz: -1.2 });
          // The twirl happens while airborne, eased so take-off and landing face the same way.
          const air = Math.min(1, Math.max(0, (p - 0.12) / 0.7));
          const turn = air * air * (3 - 2 * air);
          spinRot = (s.hop.spin ?? 0) * Math.PI * 2 * turn;
          flipRot = (s.hop.flip ?? 0) * Math.PI * 2 * turn;
          fast = true;
          if (p >= 1) {
            spot = dest;
            moving = null;
            spinRot = 0;
            flipRot = 0;
            next();
          }
        } else if ('act' in s) {
          const a = ACTIONS[s.act];
          const p = stepT / a.dur;
          fast = true;
          if (p >= 1) next();
          else target = sampleAction(a, p);
        } else if ('loop' in s) {
          target = LOOPS[s.loop](T);
          if (s.dur !== undefined && stepT >= s.dur) next();
        } else if ('face' in s) {
          const p = Math.min(1, stepT / 0.4);
          facing = faceFrom + (s.face - faceFrom) * (p * p * (3 - 2 * p));
          if (p >= 1) next();
        } else if ('wait' in s) {
          if (stepT >= s.wait) next();
        }
      } else {
        // Routine finished: hold the last loop, with an optional repeated move.
        const last = config.steps[config.steps.length - 1];
        target = last && 'loop' in last ? LOOPS[last.loop](T) : LOOPS.idle(T);
        if (config.repeat) {
          if (!repeatAct && T - lastRepeat > config.repeat.every) repeatAct = { name: config.repeat.act, t: 0 };
          if (repeatAct) {
            repeatAct.t += dt;
            const a = ACTIONS[repeatAct.name];
            const p = repeatAct.t / a.dur;
            fast = true;
            if (p >= 1) {
              repeatAct = null;
              lastRepeat = T;
            } else target = sampleAction(a, p);
          }
        }
      }

      // Ease toward the target, like the model's own page; spins (rootRot) follow exactly.
      const k = 1 - Math.exp(-dt * (fast ? 24 : 10));
      for (const n of KEYS) {
        if (n === 'rootRot' || n === 'rootFlip') continue;
        cur[n] += (target[n] - cur[n]) * k;
      }
      cur.rootRot = target.rootRot;
      for (const n of KEYS) pose[n] = cur[n];
      pose.rootRot = facing + cur.rootRot + spinRot;
      pose.rootFlip = flipRot;
      place();
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [ready, size, config, pose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: ready ? 1 : 0 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      className="pointer-events-none absolute left-0 top-0 z-20"
    >
      <div ref={box} className="absolute left-0 top-0" style={{ transform: 'translate(-9999px, 0)' }}>
        {size && <ScoutStage pose={pose} width={size.w} height={size.h} onReady={onReady} onFail={onFail} />}
      </div>
    </motion.div>
  );
}
