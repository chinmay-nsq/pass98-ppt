'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { asset } from '@/lib/asset';
import type { Pose } from '@/lib/scoutPose';

/**
 * The rigged Orange Scout (public/scout.glb) in a small transparent canvas. It draws whatever is in
 * `pose` every frame; the cover slide animates that object with GSAP and moves the canvas itself.
 *
 * The camera is orthographic so pixels map linearly to model units: the canvas shows the model from
 * y = BOTTOM to y = TOP, so the feet (y = 0) sit at FEET_FRACTION of the canvas height and one
 * model unit is `height / VIEW_H` pixels.
 */
export const TOP = 2.6; // room above his crest (1.9) for jumps and spins
export const BOTTOM = -0.08;
export const VIEW_H = TOP - BOTTOM;
export const FEET_FRACTION = TOP / VIEW_H;

export interface ScoutApi {
  /**
   * Where the front of his hands would be for `pose`, relative to his feet, in canvas pixels
   * (x to the right, y up is negative). Applies the pose to measure.
   */
  measureHands: (pose: Pose) => { x: number; y: number };
  /** Where the front-most (screen-left) of the feet is for `pose`, relative to his feet origin, in px. */
  measureFoot: (pose: Pose) => { x: number; y: number };
}

type Bones = Record<string, THREE.Bone>;

const MODEL_URL = asset('/scout.glb');

// The model is parsed once per page; every stage gets its own skinned clone of it. Its geometry is
// meshopt-compressed (7.9 MB down to 1.6 MB), so the loader needs the meshopt decoder.
let modelPromise: Promise<THREE.Object3D> | null = null;
const loadModel = () => {
  modelPromise ??= new GLTFLoader()
    .setMeshoptDecoder(MeshoptDecoder)
    .loadAsync(MODEL_URL)
    .then((g) => g.scene);
  modelPromise.catch(() => void (modelPromise = null));
  return modelPromise;
};

// Flips pivot about his middle, so he rolls in place instead of swinging round his feet.
const FLIP_PIVOT = 0.95;

function applyPose(model: THREE.Object3D, b: Bones, c: Pose) {
  const f = c.rootFlip || 0;
  model.position.y = c.rootY + FLIP_PIVOT - FLIP_PIVOT * Math.cos(f);
  model.position.z = -FLIP_PIVOT * Math.sin(f);
  model.rotation.set(f, c.rootRot, 0, 'YXZ');
  b.hips?.rotation.set(c.hipsX, c.hipsY, c.hipsZ);
  b.spine?.rotation.set(c.spineX, c.spineY, c.spineZ);
  b.chest?.rotation.set(c.chestX, c.chestY, c.chestZ);
  b.head?.rotation.set(c.headX, c.headY, c.headZ);
  b.thighL?.rotation.set(c.thLx, 0, c.thLz);
  if (b.kneeL) b.kneeL.rotation.x = c.knLx;
  if (b.footL) b.footL.rotation.x = c.ftLx;
  b.thighR?.rotation.set(c.thRx, 0, c.thRz);
  if (b.kneeR) b.kneeR.rotation.x = c.knRx;
  if (b.footR) b.footR.rotation.x = c.ftRx;
  b.armL?.rotation.set(c.aLx, c.aLy, c.aLz);
  b.elbowL?.rotation.set(c.eLx, c.eLy, c.eLz);
  if (b.handL) b.handL.rotation.x = c.hLx;
  b.armR?.rotation.set(c.aRx, c.aRy, c.aRz);
  b.elbowR?.rotation.set(c.eRx, c.eRy, c.eRz);
  if (b.handR) b.handR.rotation.x = c.hRx;
}

export default function ScoutStage({
  pose,
  width,
  height,
  onReady,
  onFail,
}: {
  pose: Pose;
  width: number;
  height: number;
  onReady: (api: ScoutApi) => void;
  onFail: () => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let disposed = false;
    let raf = 0;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      onFail();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const ppu = height / VIEW_H; // pixels per model unit
    const halfW = width / ppu / 2;
    const camera = new THREE.OrthographicCamera(-halfW, halfW, TOP, BOTTOM, 0.1, 50);
    camera.position.set(0, 0, 10);

    scene.add(new THREE.HemisphereLight(0xfff3ea, 0x20140c, 0.45));
    const key = new THREE.DirectionalLight(0xfff4ea, 1.7);
    key.position.set(-2, 4, 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffb070, 1.1);
    rim.position.set(2, 3, -3);
    scene.add(rim);

    let model: THREE.Object3D | null = null;
    const bones: Bones = {};
    const handPos = new THREE.Vector3();

    loadModel().then(
      (source) => {
        if (disposed) return;
        model = cloneSkinned(source);
        model.traverse((o) => {
          if ((o as THREE.Bone).isBone) {
            bones[o.name] = o as THREE.Bone;
            if (/^elbow/.test(o.name)) o.rotation.order = 'YXZ';
          }
          const mesh = o as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.frustumCulled = false;
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (mat) {
              mat.envMapIntensity = 0.9;
              mat.side = THREE.DoubleSide;
            }
          }
        });
        scene.add(model);
        const m = model;
        onReady({
          measureHands: (p) => {
            applyPose(m, bones, p);
            m.updateMatrixWorld(true);
            let x = Infinity;
            let y = 0;
            for (const name of ['handL', 'handR']) {
              const b = bones[name];
              if (!b) continue;
              b.getWorldPosition(handPos);
              x = Math.min(x, handPos.x);
              y += handPos.y / 2;
            }
            // Bone origins sit at the wrist; the fist reaches about 0.07 further out.
            return { x: (x - 0.07) * ppu, y: -y * ppu };
          },
          measureFoot: (p) => {
            applyPose(m, bones, p);
            m.updateMatrixWorld(true);
            let x = Infinity;
            let y = 0;
            for (const name of ['footL', 'footR']) {
              const b = bones[name];
              if (!b) continue;
              b.getWorldPosition(handPos);
              if (handPos.x < x) {
                x = handPos.x;
                y = handPos.y;
              }
            }
            // The bone sits at the ankle; the sole reaches about 0.1 further.
            return { x: (x - 0.1) * ppu, y: -y * ppu };
          },
        });
      },
      () => {
        if (!disposed) onFail();
      },
    );

    const frame = () => {
      if (model) applyPose(model, bones, pose);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      pmrem.dispose();
      renderer.dispose();
    };
    // The canvas is created once per size; pose is a mutable object read every frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  return <canvas ref={ref} width={width} height={height} style={{ width, height, display: 'block' }} aria-hidden />;
}
