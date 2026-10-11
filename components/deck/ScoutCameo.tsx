'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { gsap } from '@/lib/gsap';
import { ACTIONS, KEYS, LOOPS, P, sampleAction, type ActionName, type LoopName, type Pose } from '@/lib/scoutPose';
import { FEET_FRACTION, VIEW_H } from './ScoutStage';

const ScoutStage = dynamic(() => import('./ScoutStage'), { ssr: false });

/**
 * One step of a cameo routine.
 *  - `run`: run from x `from` to x `to` (fractions of the screen width) over `dur` seconds.
 *  - `act`: play one of the model's moves once.
 *  - `loop`: hold a looping move (idle, dance) for `dur` seconds, or forever if `dur` is omitted.
 *  - `face`: turn to face a direction (radians: 0 = audience, -π/2 = screen-left).
 *  - `wait`: idle for `dur` seconds.
 */
export type CameoStep =
  | { run: { from: number; to: number; dur: number } }
  | { act: ActionName }
  | { loop: LoopName; dur?: number }
  | { face: number }
  | { wait: number };

export interface CameoConfig {
  /** Where his feet stand, as fractions of the screen (x across, y down). */
  x: number;
  y: number;
  /** His height as a fraction of the screen height. */
  size: number;
  /** Starting direction (radians); defaults to facing the audience. */
  facing?: number;
  /** The routine; the last step should normally be a `loop` without a duration. */
  steps: CameoStep[];
  /** After the routine, repeat this move every `every` seconds (e.g. a wave). */
  repeat?: { act: ActionName; every: number };
}

const MODEL_H = 1.9; // model units from feet to the top of the crest

/**
 * The Orange Scout making a cameo on a slide. It runs a small script of moves (ported from the
 * model's own animation page): the pose eases toward each step's target every frame, exactly as the
 * original page does, and the canvas is moved for runs.
 */
export default function ScoutCameo({ config }: { config: CameoConfig }) {
  const pose = useRef<Pose>(P({ rootRot: config.facing ?? 0 })).current;
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [ready, setReady] = useState(false);

  // Size from the viewport once on mount.
  useEffect(() => {
    const ppu = (config.size * window.innerHeight) / MODEL_H;
    const h = Math.round(VIEW_H * ppu);
    setSize({ w: Math.round(h * 0.95), h });
  }, [config.size]);

  const onReady = useCallback(() => setReady(true), []);
  const onFail = useCallback(() => setReady(false), []);

  useEffect(() => {
    if (!ready || !size || !box.current) return;
    const el = box.current;
    const W = size.w;
    const H = size.h;
    const vw = () => window.innerWidth;
    const vh = () => window.innerHeight;

    let x = config.x;
    let facing = config.facing ?? 0;
    let stepIndex = -1;
    let stepT = 0;
    let T = 0;
    let lastRepeat = 0;
    let repeatAct: { name: ActionName; t: number } | null = null;
    let runFrom = 0;
    let faceFrom = 0;
    const cur: Pose = { ...pose };

    const place = () => {
      gsap.set(el, { x: x * vw() - W / 2, y: config.y * vh() - FEET_FRACTION * H });
    };

    const next = () => {
      stepIndex++;
      stepT = 0;
      const s = config.steps[stepIndex];
      if (!s) return;
      if ('run' in s) {
        runFrom = s.run.from;
        x = s.run.from;
        facing = s.run.to < s.run.from ? -Math.PI / 2 : Math.PI / 2;
      }
      if ('face' in s) faceFrom = facing;
    };
    next();
    place();

    const tick = () => {
      const dt = Math.min(0.05, gsap.ticker.deltaRatio() / 60);
      T += dt;
      stepT += dt;
      const s = config.steps[stepIndex];
      let target: Pose = LOOPS.idle(T);
      let fast = false;

      if (s) {
        if ('run' in s) {
          const p = Math.min(1, stepT / s.run.dur);
          x = runFrom + (s.run.to - runFrom) * p;
          target = LOOPS.run(T);
          if (p >= 1) next();
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
        if (n === 'rootRot') continue;
        cur[n] += (target[n] - cur[n]) * k;
      }
      cur.rootRot = target.rootRot;
      for (const n of KEYS) pose[n] = cur[n];
      pose.rootRot = facing + cur.rootRot;
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
