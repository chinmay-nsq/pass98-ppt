'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { MascotConfig } from '@/components/slides/types';
import { Mascot2D } from '@/components/ui/Mascot2D';
import { cn } from '@/lib/cn';
import { gsap } from '@/lib/gsap';
import { CROSSED, cheerPose, makeRigState, startIdle, thinkPose, wave } from '@/lib/mascotRig';

/**
 * The Pass98 mascot standing at the edge of a slide. He is the 2D rigged character (see
 * lib/mascotRig.ts), so his whole body acts: he breathes and blinks, waves when idle, bounces with
 * his fists up when cheering, and rests a hand on his chin and looks around when thinking.
 * Clicking him makes him jump.
 */
export default function MascotLayer({ config }: { config: MascotConfig }) {
  const { side, mood = 'idle', say, size = 'md' } = config;
  const state = useRef(makeRigState()).current;

  useEffect(() => {
    const rnd = gsap.utils.random;
    const stopIdle = startIdle(state);
    const tl = gsap.timeline();
    let waveTl: gsap.core.Timeline | null = null;
    let timer: gsap.core.Tween | null = null;

    if (mood === 'cheer') {
      // Fists up, grinning, bouncing on the spot.
      cheerPose(state);
      tl.to(state, { hop: 34, sy: 1.08, sx: 0.96, liftL: 18, liftR: 18, splayL: 7, splayR: 7, duration: 0.32, ease: 'power2.out' })
        .to(state, { hop: 0, sy: 0.9, sx: 1.08, liftL: 0, liftR: 0, splayL: 0, splayR: 0, duration: 0.26, ease: 'power2.in' })
        .to(state, { sy: 1, sx: 1, duration: 0.16, ease: 'back.out(3)' })
        .to({}, { duration: 0.3 })
        .repeat(-1);
    } else if (mood === 'think') {
      // Hand on chin; his eyes wander off to the side while he considers.
      thinkPose(state);
      tl.to(state, { look: 0.7, lookY: -0.6, tilt: 9, duration: 0.8, ease: 'sine.inOut' }, '+=1.4')
        .to(state, { look: -0.8, lookY: -0.9, tilt: 6, duration: 0.8, ease: 'sine.inOut' }, '+=1.6')
        .repeat(-1);
    } else {
      // Arms folded like the character sheet, with a friendly wave every few seconds.
      Object.assign(state, CROSSED);
      const loop = () => {
        waveTl = wave(state, 2);
        timer = gsap.delayedCall(rnd(5, 7), loop);
      };
      timer = gsap.delayedCall(1.4, loop);
    }

    return () => {
      stopIdle();
      tl.kill();
      waveTl?.kill();
      timer?.kill();
      gsap.killTweensOf(state);
    };
  }, [state, mood]);

  // A poke: he jumps with both arms up and a big grin, then goes back to what he was doing.
  const poke = () => {
    if (mood === 'cheer') return;
    gsap
      .timeline()
      .to(state, { hop: 48, sy: 1.12, sx: 0.94, armL: 150, armR: 150, foreL: 25, foreR: 25, liftL: 20, liftR: 20, mouth: 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
      .to(state, { hop: 0, sy: 0.88, sx: 1.1, liftL: 0, liftR: 0, duration: 0.22, ease: 'power2.in' })
      .to(state, { sy: 1, sx: 1, duration: 0.2, ease: 'back.out(3)' })
      .to(state, { armL: CROSSED.armL, armR: CROSSED.armR, foreL: CROSSED.foreL, foreR: CROSSED.foreR, mouth: 0, duration: 0.35, ease: 'power2.inOut' })
      .add(() => {
        if (mood === 'think') thinkPose(state);
      });
  };

  const box = size === 'lg' ? 'h-[min(62vh,32rem)]' : 'h-[min(52vh,26rem)]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, transition: { duration: 0.25 } }}
      transition={{ type: 'spring', stiffness: 160, damping: 17, delay: 0.15 }}
      className={cn(
        'pointer-events-none absolute bottom-[clamp(4.4rem,11vh,6.5rem)] z-20 hidden flex-col items-center md:flex',
        side === 'right' ? 'right-[clamp(0.75rem,2.6vw,3rem)]' : 'left-[clamp(0.75rem,2.6vw,3rem)]',
      )}
    >
      {say && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 1.1 }}
          className="glass-hot relative mb-9 max-w-[16rem] rounded-2xl px-4 py-2.5 text-center text-[0.84rem] font-medium leading-snug text-ink"
        >
          {say}
          <span className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-b border-r border-brand/40 bg-[#1a0d06]" />
        </motion.div>
      )}

      <div className={cn('relative aspect-[300/600]', box)}>
        <Mascot2D state={state} className="size-full" />
        {/* Clicking him makes him jump. */}
        <button
          type="button"
          aria-label="Poke the mascot"
          onClick={poke}
          className="pointer-events-auto absolute inset-x-[16%] inset-y-[8%] cursor-pointer rounded-3xl outline-none"
        />
      </div>
    </motion.div>
  );
}
