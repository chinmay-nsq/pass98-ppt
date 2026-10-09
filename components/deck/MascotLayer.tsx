'use client';

import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, useGLTF } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import type { MascotConfig, MascotMood } from '@/components/slides/types';
import { cn } from '@/lib/cn';

/**
 * The Pass98 mascot: the same 3D character that stands on the product's dashboard
 * (LevelUp-FrontEnd/public/model.glb), lit with the same self-hosted studio HDR.
 * The model ships no animation clips, so mood is expressed with rotation, scale and small hops.
 */

const MODEL_URL = '/model.glb';
const LIGHTING_URL = '/studio-lighting.hdr';
const HEIGHT = 2.5; // world units the model is normalised to

useGLTF.preload(MODEL_URL);

const ease = (p: number) => (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);

function Character({ mood, pulse, onReady }: { mood: MascotMood; pulse: number; onReady: () => void }) {
  const { scene } = useGLTF(MODEL_URL);
  // Mounting means the model has loaded (Suspense), so the layer can safely rise into view.
  useEffect(() => onReady(), [onReady]);
  const ref = useRef<THREE.Group>(null);
  const spinFrom = useRef<number | null>(null);
  const lastPulse = useRef(pulse);
  const born = useRef<number | null>(null);

  // The geometry is authored facing -X, so it is yawed -90 degrees to face the camera. After that
  // the bounding box tells us how to centre the model and scale it to a known height.
  const fit = useMemo(() => {
    scene.rotation.set(0, -Math.PI / 2, 0);
    scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    const scale = HEIGHT / Math.max(size.y, 0.0001);
    return { scale, offset: centre.multiplyScalar(-scale) };
  }, [scene]);

  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    born.current ??= t;

    // A click (pulse) or arriving on the slide triggers one full turn.
    if (pulse !== lastPulse.current) {
      lastPulse.current = pulse;
      spinFrom.current = t;
    }
    if (spinFrom.current === null && t - born.current < 0.05) spinFrom.current = t;

    let yaw = 0;
    let roll = 0;
    let hop = 0;
    let squash = 1 + Math.sin(t * 1.6) * 0.012;

    if (mood === 'cheer') {
      hop = Math.abs(Math.sin(t * 3.1)) * 0.16;
      roll = Math.sin(t * 6.2) * 0.07;
      yaw = Math.sin(t * 1.2) * 0.18;
    } else if (mood === 'think') {
      yaw = Math.sin(t * 0.8) * 0.4;
      roll = Math.sin(t * 1.6) * 0.06;
    } else {
      yaw = Math.sin(t * 0.5) * 0.1;
    }

    // Follows the pointer a little, so he feels like he is looking at you.
    yaw += state.pointer.x * 0.35;

    if (spinFrom.current !== null) {
      const p = Math.min(1, (t - spinFrom.current) / 1.3);
      yaw += ease(p) * Math.PI * 2;
      squash *= 1 + Math.sin(p * Math.PI) * 0.1;
      if (p >= 1) spinFrom.current = null;
    }

    g.rotation.set(0, yaw, roll);
    g.position.y = hop;
    g.scale.setScalar(squash);
  });

  return (
    <group ref={ref}>
      <group position={fit.offset} scale={fit.scale}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

class Safe extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function MascotLayer({ config }: { config: MascotConfig }) {
  const { side, mood = 'idle', say, size = 'md' } = config;
  const [pulse, setPulse] = useState(0);
  const [ready, setReady] = useState(false);
  const onReady = useMemo(() => () => setReady(true), []);

  const box = size === 'lg' ? 'h-[min(58vh,30rem)] w-[min(34vw,22rem)]' : 'h-[min(46vh,23rem)] w-[min(26vw,17rem)]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 60, scale: ready ? 1 : 0.9 }}
      exit={{ opacity: 0, y: 40, transition: { duration: 0.25 } }}
      transition={{ type: 'spring', stiffness: 160, damping: 17, delay: ready ? 0.15 : 0 }}
      className={cn(
        'pointer-events-none absolute bottom-[clamp(4.4rem,11vh,6.5rem)] z-20 hidden flex-col items-center md:flex',
        side === 'right' ? 'right-[clamp(0.75rem,2.6vw,3rem)]' : 'left-[clamp(0.75rem,2.6vw,3rem)]',
      )}
    >
      {say && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 10 }}
          animate={{ opacity: ready ? 1 : 0, scale: ready ? 1 : 0.7, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 1.1 }}
          className="glass-hot relative mb-1 max-w-[16rem] rounded-2xl px-4 py-2.5 text-center text-[0.84rem] font-medium leading-snug text-ink"
        >
          {say}
          <span className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-b border-r border-brand/40 bg-[#1a0d06]" />
        </motion.div>
      )}

      <div className={cn('relative', box)}>
        <Safe>
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 7.2], fov: 30 }}
            gl={{ alpha: true, antialias: true }}
          >
            <ambientLight intensity={0.7} />
            <pointLight position={[0, 2.5, -1.5]} intensity={22} color="#fb923c" />
            <pointLight position={[2.5, 1, 3]} intensity={10} color="#ffffff" />
            <Suspense fallback={null}>
              <Environment files={LIGHTING_URL} environmentIntensity={0.55} />
              <Character mood={mood} pulse={pulse} onReady={onReady} />
            </Suspense>
          </Canvas>
        </Safe>
        {/* Clicking him spins him once. */}
        <button
          type="button"
          aria-label="Make the mascot spin"
          onClick={() => setPulse((n) => n + 1)}
          className="pointer-events-auto absolute inset-x-[18%] inset-y-[10%] cursor-pointer rounded-full outline-none"
        />
      </div>
    </motion.div>
  );
}
