/**
 * The mascot's model is one fused mesh with no skeleton, so its limbs cannot move. It is animated
 * the way a toy figure is: the whole body is squashed, stretched, turned and leaned. This plain
 * object is the shared "pose": GSAP tweens its numbers, and the 3D scene reads them every frame, so
 * a whole jump animation runs without a single React re-render.
 */
export interface Pose {
  /** Width scale (1 = normal). Squash makes this larger, stretch smaller. */
  sx: number;
  /** Height scale, taken from the feet. */
  sy: number;
  /** Turn around the vertical axis, in radians (0 faces the camera). */
  yaw: number;
  /** Lean sideways, in radians. */
  roll: number;
  /** Lean forward or back, in radians. */
  pitch: number;
}

export const makePose = (): Pose => ({ sx: 1, sy: 1, yaw: 0, roll: 0, pitch: 0 });

export const resetPose = (p: Pose) => Object.assign(p, makePose());

/**
 * Where the soles appear in the mascot canvas, as a fraction of its height from the top. It follows
 * from the scene in MascotActor: feet 1.25 units below centre, camera 7.2 away with a 30 degree
 * field of view, so 0.5 + 1.25 / (2 * 7.2 * tan(15deg)) = 0.824.
 */
export const FEET_FRACTION = 0.824;
