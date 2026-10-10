'use client';

import { gsap } from '@/lib/gsap';

/**
 * The Pass98 mascot as a 2D puppet. The character (components/ui/Mascot2D.tsx) is drawn as layered
 * SVG with every joint in its own group, so the whole body can move: head and crest, two-segment
 * arms, legs that lift and splay, boots, blinking eyes, brows and three mouths, plus a `turn` that
 * swings him into a three-quarter view (face, ears, zip and shoulders shift; the far arm goes
 * behind the body).
 *
 * Animation works on one plain object, `RigState`. GSAP tweens its numbers (a walk, a push, a
 * wave), and `renderRig` writes them into the SVG's `transform` attributes on every frame. Each
 * part rotates about an exact joint, so an arm then a forearm behave like a real arm.
 *
 * Conventions: arms and legs are authored for the screen-left side and mirrored for the right, so
 * the same number means the same thing on both sides. Positive `arm` raises the arm outward,
 * positive `fore` bends the elbow so the hand comes in and up, positive `splay` swings a leg outward.
 * Negative `turn` faces him toward screen-left.
 */

export interface RigState {
  // Whole body
  sx: number; // width scale, about the feet
  sy: number; // height scale, about the feet
  roll: number; // degrees, rotation of the whole body about its middle
  hop: number; // SVG units, lifts the whole body off the floor
  lean: number; // degrees, lean about the hips
  turn: number; // -1 (facing screen-left) .. 0 (facing us)
  // Head and face
  tilt: number; // degrees, head roll about the neck
  headY: number; // units, head nod
  look: number; // -1..1, pupils left/right
  lookY: number; // -1..1, pupils up/down
  blink: number; // 0 open .. 1 closed
  brow: number; // degrees, how determined/angry the brows are
  browLift: number; // units, brows raised when negative
  mouth: number; // 0 smirk, 1 open, 2 gritted teeth
  crest: number; // degrees, extra rotation of the logo crest
  // Arms
  armL: number;
  foreL: number;
  armR: number;
  foreR: number;
  // Legs
  splayL: number;
  liftL: number;
  ankleL: number;
  splayR: number;
  liftR: number;
  ankleR: number;
  // Motion the host reports, used for the crest's secondary motion
  vy: number;
  // Idle layers, added on top so they never fight with scripted moves
  breath: number;
  sway: number;
  armSway: number;
  // Crest spring (internal)
  ca: number;
  cv: number;
}

type Pose = Omit<RigState, 'breath' | 'sway' | 'armSway' | 'ca' | 'cv'>;
export type RigPatch = { [K in keyof RigState]?: RigState[K] };

export const NEUTRAL: Pose = {
  sx: 1,
  sy: 1,
  roll: 0,
  hop: 0,
  lean: 0,
  turn: 0,
  tilt: 0,
  headY: 0,
  look: 0,
  lookY: 0,
  blink: 0,
  brow: 8,
  browLift: 0,
  mouth: 0,
  crest: 0,
  armL: 5,
  foreL: 4,
  armR: 5,
  foreR: 4,
  splayL: 0,
  liftL: 0,
  ankleL: 0,
  splayR: 0,
  liftR: 0,
  ankleR: 0,
  vy: 0,
};

/** The character sheet's stance: arms folded across his chest, a confident smirk. */
export const CROSSED: RigPatch = { armL: 12, foreL: 112, armR: 14, foreR: 104, tilt: -2, brow: 8, mouth: 0 };

/** Turned toward screen-left and shoving with both hands at shoulder height, legs in a stride. */
export const PUSH: RigPatch = {
  turn: -1,
  lean: -16,
  armL: 74,
  foreL: 22,
  armR: -84,
  foreR: -6,
  splayL: 13,
  splayR: 17,
  liftL: 4,
  liftR: 0,
  ankleL: -8,
  ankleR: 10,
  tilt: -4,
  brow: 20,
  browLift: 0,
  mouth: 2,
  look: -1,
  lookY: 0,
  hop: 0,
};

/**
 * Leaning on something to his screen-left: the near hand rests flat on it, the other sits on his
 * hip, weight on one leg, a cool smirk, eyes on what he is leaning on. Used at the end of the cover,
 * where he props himself against the "8" of "98".
 */
export const LEAN: RigPatch = {
  turn: -0.25,
  lean: -8,
  tilt: -3,
  armL: 80,
  foreL: 6,
  armR: 20,
  foreR: 96,
  splayL: 3,
  splayR: -2,
  liftL: 0,
  liftR: 4,
  ankleL: 0,
  ankleR: 4,
  brow: 8,
  browLift: 0,
  mouth: 0,
  look: -0.55,
  lookY: 0.1,
  hop: 0,
  sy: 1,
  sx: 1,
  roll: 0,
  headY: 0,
};

export const makeRigState = (): RigState => ({ ...NEUTRAL, breath: 0, sway: 0, armSway: 0, ca: 0, cv: 0 });
export const resetRig = (s: RigState) => Object.assign(s, makeRigState());

export type Parts = Record<string, SVGElement>;

/** Finds every `[data-part]` element of the mascot SVG, by name. */
export const collectParts = (svg: SVGElement): Parts => {
  const parts: Parts = {};
  svg.querySelectorAll<SVGElement>('[data-part]').forEach((el) => {
    parts[el.dataset.part!] = el;
  });
  return parts;
};

// Joint positions in the SVG's own coordinates (viewBox 0 0 300 600), matching Mascot2D.
export const VIEW = { w: 300, h: 600 };
export const FEET = { x: 150, y: 590 };
const HIP = { x: 150, y: 404 };
const NECK = { x: 150, y: 228 };
const CREST_BASE = { x: 150, y: 68 };
const SHOULDER = { x: 110, y: 262 };
const ELBOW = { x: 103, y: 334 };
const HIP_L = { x: 130, y: 404 };
const ANKLE_L = { x: 130, y: 562 };
const EYE_Y = 160;
const EYE_L = 130;
const EYE_R = 170;
const BROW_L_INNER = { x: 145, y: 151 };
const BROW_R_INNER = { x: 155, y: 151 };
const MID = { x: 150, y: 330 };
const LEG = 150; // hip to ankle

const set = (el: SVGElement | undefined, transform: string) => el?.setAttribute('transform', transform);

/** Writes the state into the SVG. Cheap enough to run every frame. */
export function renderRig(p: Parts, s: RigState) {
  const sy = s.sy * (1 + s.breath);
  const sx = s.sx * (1 - s.breath * 0.6);
  const t = s.turn;
  const narrow = 1 - 0.26 * Math.abs(t); // shoulders come together as he turns side-on

  set(p.flip, `translate(0 ${-s.hop}) rotate(${s.roll} ${MID.x} ${MID.y})`);
  set(p.squash, `translate(${FEET.x} ${FEET.y}) scale(${sx} ${sy}) translate(${-FEET.x} ${-FEET.y})`);
  set(p.body, `rotate(${s.lean} ${HIP.x} ${HIP.y})`);
  const torso = `translate(150 0) scale(${narrow} 1) translate(-150 0)`;
  set(p.torso, torso);
  set(p.armsBack, torso);
  set(p.armsFront, torso);
  set(p.front, `translate(${t * 11} 0)`);

  // Head, with a spring on the crest so it trails behind sudden moves.
  set(p.head, `translate(0 ${s.headY}) rotate(${s.tilt + s.sway} ${NECK.x} ${NECK.y})`);
  set(p.face, `translate(${t * 13} 0)`);
  set(p.podL, `translate(${-t * 15} 0)`);
  set(p.podR, `translate(${t * 21} 0)`);
  const target = -(s.tilt + s.sway) * 0.5 - s.lean * 0.6 - s.vy * 0.45 + s.crest;
  s.cv += (target - s.ca) * 0.14;
  s.cv *= 0.8;
  s.ca += s.cv;
  set(p.crest, `translate(${t * 6} 0) rotate(${s.ca} ${CREST_BASE.x} ${CREST_BASE.y})`);

  // Arms. The screen-left arm exists twice: in front of the body, and behind it for when he has
  // turned side-on (it is then his far arm). Only one copy is visible at a time.
  const armL = `rotate(${s.armL + s.armSway} ${SHOULDER.x} ${SHOULDER.y})`;
  const foreL = `rotate(${-s.foreL} ${ELBOW.x} ${ELBOW.y})`;
  set(p.armL, armL);
  set(p.foreL, foreL);
  set(p.armL2, armL);
  set(p.foreL2, foreL);
  const behind = t < -0.5;
  p.armLfront?.setAttribute('opacity', behind ? '0' : '1');
  p.armLback?.setAttribute('opacity', behind ? '1' : '0');
  set(p.armR, `rotate(${s.armR + s.armSway} ${SHOULDER.x} ${SHOULDER.y})`);
  set(p.foreR, `rotate(${-s.foreR} ${ELBOW.x} ${ELBOW.y})`);

  // Legs: splay swings the whole leg; lift shortens the trousers and raises the boot (a bent knee
  // seen from the front); ankle tilts the boot.
  const leg = (side: 'L' | 'R', splay: number, lift: number, ankle: number) => {
    set(p[`leg${side}`], `rotate(${splay} ${HIP_L.x} ${HIP_L.y})`);
    set(p[`pants${side}`], `translate(${HIP_L.x} ${HIP_L.y}) scale(1 ${Math.max(0.25, 1 - lift / LEG)}) translate(${-HIP_L.x} ${-HIP_L.y})`);
    set(p[`shoe${side}`], `translate(0 ${-lift}) rotate(${ankle} ${ANKLE_L.x} ${ANKLE_L.y})`);
  };
  leg('L', s.splayL, s.liftL, s.ankleL);
  leg('R', s.splayR, s.liftR, s.ankleR);

  // Face
  const eye = (side: 'L' | 'R', cx: number) => {
    set(p[`eye${side}`], `translate(${cx} ${EYE_Y}) scale(1 ${1 - 0.92 * s.blink}) translate(${-cx} ${-EYE_Y})`);
    set(p[`pupil${side}`], `translate(${s.look * 4} ${s.lookY * 3})`);
  };
  eye('L', EYE_L);
  eye('R', EYE_R);
  set(p.browL, `translate(0 ${s.browLift}) rotate(${s.brow} ${BROW_L_INNER.x} ${BROW_L_INNER.y})`);
  set(p.browR, `translate(0 ${s.browLift}) rotate(${-s.brow} ${BROW_R_INNER.x} ${BROW_R_INNER.y})`);
  const m = Math.round(s.mouth);
  for (let i = 0; i < 3; i++) p[`mouth${i}`]?.setAttribute('opacity', i === m ? '1' : '0');
}

// ── Idle life: breathing, a gentle sway, and blinking ─────────────────────────────────────────

/** Starts the always-on life of the character. Returns a function that stops it. */
export function startIdle(s: RigState): () => void {
  const rnd = gsap.utils.random;
  const tl = gsap.timeline();
  tl.to(s, { breath: 0.01, duration: 1.25, yoyo: true, repeat: -1, ease: 'sine.inOut' }, 0);
  tl.to(s, { sway: 1.8, duration: 2.2, yoyo: true, repeat: -1, ease: 'sine.inOut' }, 0);
  tl.to(s, { armSway: 1.5, duration: 1.7, yoyo: true, repeat: -1, ease: 'sine.inOut' }, 0.3);

  let timer: gsap.core.Tween | null = null;
  let alive = true;
  const blink = () => {
    if (!alive) return;
    gsap.to(s, {
      blink: 1,
      duration: 0.06,
      yoyo: true,
      repeat: 1,
      ease: 'none',
      onComplete: () => {
        if (alive) timer = gsap.delayedCall(rnd(1.6, 4.2), blink);
      },
    });
  };
  timer = gsap.delayedCall(rnd(0.8, 2), blink);

  return () => {
    alive = false;
    tl.kill();
    timer?.kill();
    Object.assign(s, { breath: 0, sway: 0, armSway: 0 });
  };
}

// ── Reusable moves ─────────────────────────────────────────────────────────────────────────────

/** Tweens a set of state fields. */
export const to = (s: RigState, vars: RigPatch, duration = 0.3, ease = 'power2.out') =>
  gsap.to(s, { ...vars, duration, ease, overwrite: 'auto' });

/** Arms folded, as on the character sheet. */
export const crossArms = (s: RigState, duration = 0.5) => to(s, CROSSED, duration, 'power2.inOut');

/** A friendly wave with the right arm, then back to folded arms. */
export function wave(s: RigState, seconds = 2) {
  const tl = gsap.timeline();
  tl.to(s, { armR: 150, foreR: 70, armL: 12, foreL: 112, mouth: 1, tilt: -4, duration: 0.4, ease: 'back.out(1.6)' });
  tl.to(s, { foreR: 18, duration: 0.18, yoyo: true, repeat: Math.max(2, Math.round(seconds / 0.18)), ease: 'sine.inOut' });
  tl.to(s, { ...CROSSED, duration: 0.5, ease: 'power2.inOut' });
  return tl;
}

/** Fists in the air, big grin. */
export function cheerPose(s: RigState) {
  return gsap.to(s, {
    turn: 0,
    armL: 158,
    armR: 158,
    foreL: 30,
    foreR: 30,
    mouth: 1,
    brow: -4,
    browLift: -3,
    duration: 0.35,
    ease: 'back.out(2)',
    overwrite: 'auto',
  });
}

/** One hand to the chin, head tilted, looking up and away. */
export function thinkPose(s: RigState) {
  return gsap.to(s, {
    armR: 30,
    foreR: 150,
    armL: 12,
    foreL: 112,
    tilt: 7,
    look: -0.8,
    lookY: -0.9,
    brow: 2,
    browLift: -2,
    mouth: 0,
    duration: 0.6,
    ease: 'power2.inOut',
    overwrite: 'auto',
  });
}

/** Back to a relaxed standing pose. */
export function relax(s: RigState, duration = 0.4) {
  return gsap.to(s, { ...NEUTRAL, duration, ease: 'power2.out', overwrite: 'auto' });
}

export function leanPose(s: RigState, duration = 0.55) {
  return gsap.to(s, { ...LEAN, duration, ease: 'power2.inOut', overwrite: 'auto' });
}

/** While leaning he glances out at the audience now and then, then back at what he leans on. */
export function leanLife(s: RigState): () => void {
  let alive = true;
  let t: gsap.core.Tween | null = null;
  const glance = () => {
    if (!alive) return;
    gsap
      .timeline({
        onComplete: () => {
          if (alive) t = gsap.delayedCall(gsap.utils.random(2.2, 4), glance);
        },
      })
      .to(s, { look: 0.15, lookY: 0, turn: -0.05, tilt: 1, brow: 2, browLift: -2, mouth: 0, duration: 0.35, ease: 'power2.out' })
      .to({}, { duration: 1.1 })
      .to(s, { look: LEAN.look, lookY: LEAN.lookY, turn: LEAN.turn, tilt: LEAN.tilt, brow: LEAN.brow, browLift: 0, duration: 0.5, ease: 'power2.inOut' });
  };
  t = gsap.delayedCall(1.6, glance);
  return () => {
    alive = false;
    t?.kill();
  };
}

/**
 * One frame of a walk cycle, given the distance walked in steps: legs lift and swing in turn, arms
 * swing opposite, the body bobs.
 */
export function walkPhase(s: RigState, steps: number, facing = -0.65) {
  const ph = steps * Math.PI;
  const a = Math.sin(ph);
  s.turn = facing;
  s.liftL = Math.max(0, a) * 22;
  s.liftR = Math.max(0, -a) * 22;
  s.splayL = 6 + a * 9;
  s.splayR = 6 - a * 9;
  s.armL = 10 - a * 22;
  s.armR = 10 + a * 22;
  s.foreL = 18;
  s.foreR = 18;
  s.hop = Math.abs(Math.cos(ph)) * 5;
  s.lean = -5;
}
