'use client';

import { useEffect, useRef } from 'react';
import { Mascot2D } from '@/components/ui/Mascot2D';
import { CROSSED, LEAN, PUSH, makeRigState, startIdle, walkPhase, wave, type RigPatch, type RigState } from '@/lib/mascotRig';

/**
 * A lab for the mascot: the same character in every pose the deck uses, plus live ones (idle with
 * folded arms and a wave, a walk cycle, a push). Open /mascot.
 */
const walkFrame = (steps: number): RigPatch => {
  const s = makeRigState();
  walkPhase(s, steps);
  return s;
};

const POSES: { name: string; vars: RigPatch }[] = [
  { name: 'Arms folded', vars: CROSSED },
  { name: 'Standing', vars: {} },
  { name: 'Wave', vars: { ...CROSSED, armR: 150, foreR: 60, mouth: 1, tilt: -4 } },
  { name: 'Cheer', vars: { armL: 158, armR: 158, foreL: 30, foreR: 30, mouth: 1, brow: -4, browLift: -3 } },
  { name: 'Think', vars: { ...CROSSED, armR: 30, foreR: 150, tilt: 7, look: -0.8, lookY: -0.9, brow: 2, browLift: -2 } },
  { name: 'Turn (¾)', vars: { ...CROSSED, turn: -1, look: -1 } },
  { name: 'Walk', vars: walkFrame(0.5) },
  { name: 'Push', vars: PUSH },
  { name: 'Lean on the 8', vars: LEAN },
];

function Cell({ name, vars }: { name: string; vars: RigPatch }) {
  const state = useRef(Object.assign(makeRigState(), vars)).current;
  return (
    <figure className="glass flex flex-col items-center rounded-2xl p-4">
      <Mascot2D state={state} className="h-72 w-auto" />
      <figcaption className="mono mt-2 text-xs tracking-widest text-dim">{name.toUpperCase()}</figcaption>
    </figure>
  );
}

function LiveIdle() {
  const state = useRef(Object.assign(makeRigState(), CROSSED)).current;
  useEffect(() => {
    const stop = startIdle(state);
    const loop = () => wave(state, 2);
    const first = window.setTimeout(loop, 1200);
    const every = window.setInterval(loop, 6000);
    return () => {
      stop();
      window.clearTimeout(first);
      window.clearInterval(every);
    };
  }, [state]);
  return <LiveFrame state={state} label="Live · idle + wave" />;
}

function LiveWalk() {
  const state = useRef(makeRigState()).current;
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      walkPhase(state, (performance.now() - t0) / 380);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state]);
  return <LiveFrame state={state} label="Live · walk" />;
}

function LiveFrame({ state, label }: { state: RigState; label: string }) {
  return (
    <figure className="glass-hot flex flex-col items-center rounded-2xl p-4">
      <Mascot2D state={state} className="h-72 w-auto" />
      <figcaption className="mono mt-2 text-xs tracking-widest text-brand-soft">{label.toUpperCase()}</figcaption>
    </figure>
  );
}

export default function MascotLab() {
  return (
    <main className="fixed inset-0 overflow-y-auto bg-bg p-6">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow mb-2">Mascot lab</p>
        <h1 className="title-lg mb-6">The Pass98 mascot, rigged</h1>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <LiveIdle />
          <LiveWalk />
          {POSES.map((p) => (
            <Cell key={p.name} {...p} />
          ))}
        </div>
      </div>
    </main>
  );
}
