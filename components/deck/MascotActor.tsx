'use client';

import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { Pose } from '@/lib/pose';
// The scene below is framed so the soles land at FEET_FRACTION of the canvas height (see lib/pose.ts).

/**
 * The Pass98 mascot as a puppet. It draws the same model as the product dashboard, but instead of
 * deciding its own motion it just obeys `pose`, which a GSAP timeline in the slide tweens.
 *
 * The scene is set up so the model's FEET sit at a known place: the pivot is at the soles, so
 * squashing and stretching grow the body up from the floor, and the slide can put the feet exactly
 * where it wants them. With the camera below, the feet land at 82.4% of the canvas height.
 */

const MODEL_URL = '/model.glb';
const LIGHTING_URL = '/studio-lighting.hdr';
const HEIGHT = 2.5;

useGLTF.preload(MODEL_URL);

function Puppet({ pose, onReady }: { pose: Pose; onReady: () => void }) {
  const { scene } = useGLTF(MODEL_URL);
  const body = useRef<THREE.Group>(null);

  // The model is authored facing -X, so it is yawed -90 degrees to face the camera; then its
  // bounding box tells us how to centre it and scale it to a known height.
  const fit = useMemo(() => {
    scene.rotation.set(0, -Math.PI / 2, 0);
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    const scale = HEIGHT / Math.max(size.y, 0.0001);
    return { scale, x: -centre.x * scale, y: -box.min.y * scale, z: -centre.z * scale };
  }, [scene]);

  useEffect(() => onReady(), [onReady]);

  useFrame(() => {
    const b = body.current;
    if (!b) return;
    b.scale.set(pose.sx, pose.sy, pose.sx);
    b.rotation.set(pose.pitch, pose.yaw, pose.roll);
  });

  return (
    // The pivot group sits on the floor; everything the pose does grows from the soles.
    <group position={[0, -HEIGHT / 2, 0]}>
      <group ref={body}>
        <group position={[fit.x, fit.y, fit.z]} scale={fit.scale}>
          <primitive object={scene} />
        </group>
      </group>
    </group>
  );
}

class Safe extends Component<{ children: ReactNode; onFail?: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail?.();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function MascotActor({
  pose,
  onReady,
  onFail,
}: {
  pose: Pose;
  onReady: () => void;
  onFail?: () => void;
}) {
  return (
    <Safe onFail={onFail}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 7.2], fov: 30 }}
        gl={{ alpha: true, antialias: true }}
        className="pointer-events-none!"
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[0, 2.5, -1.5]} intensity={22} color="#fb923c" />
        <pointLight position={[2.5, 1, 3]} intensity={10} color="#ffffff" />
        <Suspense fallback={null}>
          <Environment files={LIGHTING_URL} environmentIntensity={0.55} />
          <Puppet pose={pose} onReady={onReady} />
        </Suspense>
      </Canvas>
    </Safe>
  );
}
