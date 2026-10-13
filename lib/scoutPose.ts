/**
 * Poses for the Orange Scout model (public/scout.glb), ported from orange-scout/web/index.html.
 *
 * Model space: about 1.9 tall, feet at y = 0, facing +Z, the character's left is +X. Every bone is
 * at identity in the bind pose (arms hanging down), so a pose is just Euler angles per bone.
 * Conventions (radians):
 *  - legs: thigh.x negative = swing forward, knee.x positive = bend, foot.x positive = point toes;
 *  - arms: arm.x negative = raise forward, armL.z positive / armR.z negative = raise sideways,
 *    elbow.x negative = bend the forearm forward;
 *  - torso and head: x positive = lean or nod forward, y = twist, z = side tilt.
 * `rootY` lifts the whole model; `rootRot` turns it about the vertical axis (-π/2 faces screen-left);
 * `rootFlip` rolls it head-over-heels about his middle (positive = a front flip, head toward you).
 */

export const KEYS = [
  'rootY', 'rootRot', 'rootFlip', 'hipsX', 'hipsY', 'hipsZ', 'spineX', 'spineY', 'spineZ', 'chestX', 'chestY', 'chestZ', 'headX', 'headY', 'headZ',
  'thLx', 'thLz', 'knLx', 'ftLx', 'thRx', 'thRz', 'knRx', 'ftRx',
  'aLx', 'aLy', 'aLz', 'eLx', 'eLy', 'eLz', 'hLx', 'aRx', 'aRy', 'aRz', 'eRx', 'eRy', 'eRz', 'hRx',
] as const;

export type Key = (typeof KEYS)[number];
export type Pose = Record<Key, number>;
export type PosePatch = Partial<Pose>;

const ZERO = Object.fromEntries(KEYS.map((k) => [k, 0])) as Pose;

/** Neutral: arms hanging slightly away from the body. */
export const NEUTRAL: Pose = { ...ZERO, aLz: 0.06, aRz: -0.06, eLx: -0.12, eRx: -0.12 };

/** Neutral plus any partial poses, merged left to right. */
export const P = (...parts: PosePatch[]): Pose => Object.assign({}, NEUTRAL, ...parts);

/** Bend the knees by `s` (0..1) while keeping the feet planted. */
export function squat(s: number): PosePatch {
  const TH = 0.15;
  const SH = 0.16;
  const a = 0.75 * s;
  const b = 1.4 * s;
  const drop = TH * (1 - Math.cos(a)) + SH * (1 - Math.cos(b - a));
  return { rootY: -drop, thLx: -a, thRx: -a, knLx: b, knRx: b, ftLx: -(b - a), ftRx: -(b - a), spineX: 0.2 * s, headX: -0.12 * s };
}

/** Facing screen-left, turned a little toward the audience so the face still reads. */
export const FACE_LEFT = -1.2;

/** One frame of a walk cycle, given the distance walked in steps. */
export function walk(steps: number, facing = FACE_LEFT): Pose {
  const f = steps * Math.PI;
  const a = Math.sin(f);
  return P({
    rootRot: facing,
    rootY: Math.abs(Math.cos(f)) * 0.025,
    spineX: 0.08,
    headX: -0.04,
    hipsY: a * 0.08,
    chestY: -a * 0.1,
    thLx: a * 0.55 - 0.05,
    thRx: -a * 0.55 - 0.05,
    knLx: 0.12 + Math.max(0, a) * 0.95,
    knRx: 0.12 + Math.max(0, -a) * 0.95,
    ftLx: -0.05,
    ftRx: -0.05,
    aLx: -a * 0.6,
    aRx: a * 0.6,
    aLz: 0.1,
    aRz: -0.1,
    eLx: -0.6,
    eRx: -0.6,
  });
}

/** Both hands out in front at chest height, leaning in, one leg forward and one braced behind. */
export const PUSH: Pose = P({
  rootRot: FACE_LEFT,
  rootY: -0.03,
  spineX: 0.32,
  chestX: 0.12,
  headX: -0.28,
  aLx: -1.42,
  aRx: -1.42,
  aLz: 0.05,
  aRz: -0.05,
  eLx: -0.06,
  eRx: -0.06,
  thLx: -0.6,
  knLx: 0.7,
  ftLx: -0.12,
  thRx: 0.42,
  knRx: 0.18,
  ftRx: 0.22,
});

/**
 * Straining against something heavy: the push pose with the legs driving in short alternating
 * shoves and the body rocking. `t` is time in seconds, `effort` 0..1 scales the strain.
 */
export function strain(t: number, effort: number): Pose {
  const f = t * 9;
  const a = Math.sin(f);
  const e = 0.4 + 0.6 * effort;
  return P(PUSH, {
    rootY: PUSH.rootY - Math.abs(a) * 0.015 * e,
    spineX: PUSH.spineX + 0.06 * effort + a * 0.02,
    chestY: a * 0.06 * e,
    headX: PUSH.headX - 0.05 * effort,
    headZ: Math.sin(t * 23) * 0.025 * effort,
    thLx: PUSH.thLx + a * 0.12 * e,
    thRx: PUSH.thRx - a * 0.12 * e,
    knLx: PUSH.knLx + Math.max(0, a) * 0.25 * e,
    knRx: PUSH.knRx + Math.max(0, -a) * 0.25 * e,
    eLx: PUSH.eLx - 0.12 * effort,
    eRx: PUSH.eRx - 0.12 * effort,
  });
}

/** The give: the word pops and he stumbles forward into the empty space. */
export const LUNGE: Pose = P(PUSH, {
  rootY: -0.06,
  spineX: 0.55,
  chestX: 0.18,
  headX: -0.15,
  aLx: -1.6,
  aRx: -1.6,
  thLx: -0.85,
  knLx: 0.95,
  thRx: 0.6,
});

/** Double-biceps flex, facing the audience. */
export const FLEX: Pose = P({ aLz: 1.15, eLz: 1.95, eLx: -0.15, aRz: -1.15, eRz: -1.95, eRx: -0.15, headX: -0.1, chestX: -0.06 });

/** Hands on hips, chest out: the proud finish. */
export const PROUD: Pose = P({ aLz: 0.55, aLx: 0.15, eLx: -1.3, eLy: 0.5, aRz: -0.55, aRx: 0.15, eRx: -1.3, eRy: -0.5, chestX: -0.05, headX: -0.04, headZ: 0.05 });

// ── Stomp ─────────────────────────────────────────────────────────────────────────────────

/** Dropping from the sky: arms up, knees lifted, turned a little toward the audience. */
export const FALL: Pose = P({ rootRot: -0.3, spineX: -0.08, headX: 0.12, aLz: 2.5, aRz: -2.5, eLz: 0.2, eRz: -0.2, thLx: -0.7, knLx: 1.2, thRx: -0.25, knRx: 0.6, ftLx: 0.3, ftRx: 0.3 });

/** The instant before impact: legs straight down, arms flung up and out. */
export const DROP: Pose = P({ rootRot: -0.3, spineX: 0.05, headX: -0.05, aLz: 1.9, aRz: -1.9, thLz: 0.08, thRz: -0.08, ftLx: 0.15, ftRx: 0.15 });

/** The stomp landing: a deep squat, fists out to the sides. */
export const LAND: Pose = P(squat(1), { rootRot: -0.3, aLz: 1.15, aRz: -1.15, aLx: -0.35, aRx: -0.35, eLx: -0.9, eRx: -0.9, headX: -0.2 });

/** Mid-air tuck for the hop off the squashed word. */
export const TUCK: Pose = P({ rootRot: 0.35, spineX: 0.15, headX: -0.1, thLx: -1.0, thRx: -1.0, knLx: 1.7, knRx: 1.7, ftLx: 0.2, ftRx: 0.2, aLz: 1.9, aRz: -1.9, eLz: 0.3, eRz: -0.3 });

// ── Flying kick ───────────────────────────────────────────────────────────────────────────

/** Kick facing: screen-left, turned slightly toward the audience. */
export const KICK_FACE = -1.35;

/** Take-off crouch at the end of the run. */
export const CROUCH: Pose = P(squat(0.7), { rootRot: KICK_FACE, spineX: 0.35, aLx: 0.6, aRx: 0.6, aLz: 0.2, aRz: -0.2, eLx: -0.4, eRx: -0.4 });

/** In the air, kicking knee chambered up to the chest, guard up. */
export const CHAMBER: Pose = P({
  rootRot: KICK_FACE, spineX: -0.1, headX: 0.1,
  thRx: -1.4, knRx: 2.0, ftRx: 0.3, thLx: -0.5, knLx: 1.5, ftLx: 0.3,
  aLx: -0.55, aLz: -0.05, eLx: -2.0, eLy: -0.4, aRx: -0.55, aRz: 0.05, eRx: -2.0, eRy: 0.4,
});

/** Full extension: kicking leg straight out, body leaning back, the other leg tucked. */
export const KICK_FLY: Pose = P({
  rootRot: KICK_FACE, spineX: -0.38, chestX: -0.12, headX: 0.3,
  thRx: -1.7, knRx: 0.04, ftRx: 0.55, thLx: -0.75, knLx: 1.9, ftLx: 0.3,
  aLx: -0.5, aLz: 0.55, eLx: -1.5, aRx: 0.45, aRz: -0.7, eRx: -0.6,
});

/** Looking up at something falling, hands half raised. */
export const LOOK_UP: Pose = P({ rootRot: -0.45, headX: -0.45, chestX: -0.08, aLx: -0.4, aRx: -0.4, aLz: 0.35, aRz: -0.35, eLx: -0.9, eRx: -0.9 });

/** Standing beside the word, relaxed: arms down, turned slightly toward it. Simple. */
export const STAND: Pose = P({ rootRot: -0.2, aLz: 0.1, aRz: -0.1, eLx: -0.2, eRx: -0.2, headY: 0.08 });

/** Gentle idle life on top of a base pose: breathing and a slight sway. */
export function idle(base: Pose, t: number): Pose {
  return P(base, {
    chestX: base.chestX + Math.sin(t * 1.7) * 0.015,
    spineX: base.spineX + Math.sin(t * 1.7) * 0.01,
    headY: base.headY + Math.sin(t * 0.6) * 0.05,
    hipsY: base.hipsY + Math.sin(t * 0.5) * 0.04,
  });
}

/** Copies `src` into `dst` (both full poses). */
export const copyPose = (dst: Pose, src: Pose) => {
  for (const k of KEYS) dst[k] = src[k];
};

/** Linear blend of two poses into `dst`. */
export const mixPose = (dst: Pose, a: Pose, b: Pose, k: number) => {
  for (const key of KEYS) dst[key] = a[key] + (b[key] - a[key]) * k;
};

// ── The model's own moves, ported from orange-scout/web/index.html ─────────────────────────────

const add = (a: Pose, b: PosePatch): Pose => {
  const o = { ...a };
  for (const k in b) o[k as Key] = (o[k as Key] || 0) + (b[k as Key] as number);
  return o;
};
const GUARD: PosePatch = { aLx: -0.55, aLz: -0.05, eLx: -2.0, eLy: -0.4, aRx: -0.55, aRz: 0.05, eRx: -2.0, eRy: 0.4, headX: 0.06 };
const WAVE: PosePatch = { aRz: -2.25, aRx: -0.15, eRx: -0.3, headZ: -0.1, spineZ: 0.05, chestZ: 0.04 };
const F: PosePatch = { aLz: 1.15, eLz: 1.95, eLx: -0.15, aRz: -1.15, eRz: -1.95, eRx: -0.15, headX: -0.1, chestX: -0.06 };
const UP: PosePatch = { aLz: 2.2, aRz: -2.2 };

export interface Action {
  dur: number;
  frames: [number, Pose][];
}

export type ActionName = 'wave' | 'jump' | 'kick' | 'punch' | 'flex' | 'spin' | 'slam';

export const ACTIONS: Record<ActionName, Action> = {
  wave: {
    dur: 2,
    frames: [[0, P()], [0.12, P(WAVE, { eRz: 0.5 })], [0.27, P(WAVE, { eRz: -0.35 })], [0.42, P(WAVE, { eRz: 0.5 })], [0.57, P(WAVE, { eRz: -0.35 })], [0.72, P(WAVE, { eRz: 0.5 })], [0.86, P(WAVE)], [1, P()]],
  },
  jump: {
    dur: 1.3,
    frames: [
      [0, P()],
      [0.2, P(squat(1), { aLx: 0.7, aRx: 0.7, aLz: 0.25, aRz: -0.25 })],
      [0.33, P(UP, { rootY: 0.18, spineX: -0.08, headX: 0.1, ftLx: 0.35, ftRx: 0.35 })],
      [0.5, P({ rootY: 0.42, thLx: -1.0, thRx: -1.0, knLx: 1.7, knRx: 1.7, ftLx: 0.2, ftRx: 0.2, spineX: 0.15, headX: -0.1, aLz: 1.9, aRz: -1.9, eLz: 0.3, eRz: -0.3 })],
      [0.68, P({ rootY: 0.16, ftLx: 0.3, ftRx: 0.3, aLz: 1.3, aRz: -1.3 })],
      [0.8, P(squat(0.85), { aLx: -0.8, aRx: -0.8, aLz: 0.3, aRz: -0.3 })],
      [1, P()],
    ],
  },
  kick: {
    dur: 1.15,
    frames: [
      [0, P(GUARD)],
      [0.22, P(GUARD, { thRx: -1.3, knRx: 1.9, ftRx: 0.3, spineX: -0.15, thLx: -0.1, knLx: 0.2, ftLx: -0.1 })],
      [0.4, P(GUARD, { thRx: -1.75, knRx: 0.05, ftRx: 0.55, spineX: -0.3, chestX: -0.1, headX: 0.2, thLx: -0.12, knLx: 0.25, ftLx: -0.13, aLz: 0.6, eLx: -1.2 })],
      [0.6, P(GUARD, { thRx: -1.3, knRx: 1.9, ftRx: 0.3, spineX: -0.15, thLx: -0.1, knLx: 0.2, ftLx: -0.1 })],
      [0.85, P(GUARD)],
      [1, P()],
    ],
  },
  punch: {
    dur: 1.3,
    frames: [
      [0, P(GUARD)],
      [0.14, P(GUARD, { aRx: -1.55, aRz: 0.15, eRx: -0.05, eRy: 0, chestY: 0.45, thLx: -0.15, thRx: 0.15 })],
      [0.3, P(GUARD, { thLx: -0.15, thRx: 0.15 })],
      [0.46, P(GUARD, { aLx: -1.55, aLz: -0.15, eLx: -0.05, eLy: 0, chestY: -0.45, thLx: -0.15, thRx: 0.15 })],
      [0.62, P(GUARD, { thLx: -0.15, thRx: 0.15 })],
      [0.8, P(GUARD, squat(0.25), { aRx: -2.2, aRz: 0.2, eRx: -1.2, eRy: 0.2, chestY: 0.3, chestX: -0.12 })],
      [1, P()],
    ],
  },
  flex: {
    dur: 1.8,
    frames: [[0, P()], [0.2, P(F)], [0.38, P(F, { rootY: 0.02, chestY: 0.15, eLz: 2.1, eRz: -1.75 })], [0.56, P(F, { chestY: -0.15, eLz: 1.75, eRz: -2.1 })], [0.74, P(F, { rootY: 0.02 })], [0.9, P(F)], [1, P()]],
  },
  // A ground-pound landing: deep squat, fists flung out, then back up.
  slam: {
    dur: 0.55,
    frames: [
      [0, P(squat(1), { aLz: 1.25, aRz: -1.25, aLx: -0.35, aRx: -0.35, eLx: -0.9, eRx: -0.9, headX: -0.2 })],
      [0.45, P(squat(0.9), { aLz: 1.1, aRz: -1.1, aLx: -0.3, aRx: -0.3, eLx: -0.9, eRx: -0.9, headX: -0.15 })],
      [1, P()],
    ],
  },
  spin: {
    dur: 1.5,
    frames: [
      [0, P()],
      [0.18, P(squat(1), { aLz: 0.4, aRz: -0.4 })],
      [0.32, P(UP, { rootY: 0.2, ftLx: 0.35, ftRx: 0.35 })],
      [0.5, P({ rootY: 0.45, rootRot: Math.PI, thLx: -0.9, thRx: -0.9, knLx: 1.6, knRx: 1.6, spineX: 0.15, aLz: 1.4, aRz: -1.4 })],
      [0.68, P({ rootY: 0.18, rootRot: Math.PI * 2, ftLx: 0.3, ftRx: 0.3, aLz: 1.2, aRz: -1.2 })],
      [0.8, P(squat(0.85), { rootRot: Math.PI * 2, aLx: -0.6, aRx: -0.6 })],
      [1, P({ rootRot: Math.PI * 2 })],
    ],
  },
};

/** The pose at progress `p` (0..1) through an action, smoothstep between keyframes. */
export function sampleAction(act: Action, p: number): Pose {
  const fr = act.frames;
  let i = 1;
  while (i < fr.length - 1 && fr[i][0] < p) i++;
  const [a, A] = fr[i - 1];
  const [b, B] = fr[i];
  let k = Math.min(1, Math.max(0, (p - a) / (b - a)));
  k = k * k * (3 - 2 * k);
  const o = { ...A };
  for (const n of KEYS) o[n] = A[n] + (B[n] - A[n]) * k;
  return o;
}

export type LoopName = 'idle' | 'dance' | 'run' | 'look';

export const LOOPS: Record<LoopName, (t: number) => Pose> = {
  idle: (t) =>
    P({
      chestX: Math.sin(t * 1.7) * 0.015,
      spineX: Math.sin(t * 1.7) * 0.01,
      headY: Math.sin(t * 0.6) * 0.06,
      hipsY: Math.sin(t * 0.5) * 0.04,
      aLz: 0.07 + Math.sin(t * 1.7) * 0.02,
      aRz: -0.07 - Math.sin(t * 1.7) * 0.02,
      aLx: Math.sin(t * 0.8) * 0.04,
      aRx: -Math.sin(t * 0.8) * 0.04,
    }),
  // Looking down at something below him (the report), breathing.
  look: (t) =>
    P({
      headX: 0.42 + Math.sin(t * 0.9) * 0.02,
      headY: Math.sin(t * 0.5) * 0.05,
      spineX: 0.14,
      chestX: 0.06 + Math.sin(t * 1.7) * 0.012,
      aLz: 0.08,
      aRz: -0.08,
      eLx: -0.25,
      eRx: -0.25,
    }),
  dance: (t) => {
    const b = t * Math.PI * 2 * 1.05;
    const s = (1 - Math.cos(2 * b)) / 2;
    const up = Math.max(0, Math.sin(b));
    const dn = Math.max(0, -Math.sin(b));
    return add(P(squat(0.35 * s)), {
      hipsY: Math.sin(b) * 0.3,
      hipsZ: Math.sin(b) * 0.06,
      chestY: -Math.sin(b) * 0.2,
      chestZ: -Math.sin(b) * 0.08,
      headZ: Math.sin(b) * 0.15,
      headX: -0.06 * s,
      thLz: up * 0.2,
      thRz: -dn * 0.2,
      aLx: -0.3,
      aLz: 0.4 + 1.3 * up,
      eLx: -1.2,
      aRx: -0.3,
      aRz: -0.4 - 1.3 * dn,
      eRx: -1.2,
    });
  },
  run: (t) => {
    const f = t * 10;
    const a = Math.sin(f);
    return P({
      rootY: Math.abs(Math.cos(f)) * 0.04,
      spineX: 0.18,
      headX: -0.12,
      hipsY: a * 0.15,
      chestY: -a * 0.2,
      thLx: a * 0.85 - 0.2,
      thRx: -a * 0.85 - 0.2,
      knLx: 0.3 + Math.max(0, a) * 1.5,
      knRx: 0.3 + Math.max(0, -a) * 1.5,
      ftLx: -0.1,
      ftRx: -0.1,
      aLx: -a * 1.0,
      aRx: a * 1.0,
      aLz: 0.15,
      aRz: -0.15,
      eLx: -1.5,
      eRx: -1.5,
    });
  },
};
