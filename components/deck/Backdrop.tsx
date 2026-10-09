'use client';

import { Component, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * The living background behind every slide: a drifting particle field, plus an optional wireframe
 * core on a few slides. The camera eases to a new pose whenever the slide changes, so moving through the
 * deck feels like travelling through one space rather than flipping between pages.
 */

// A soft round dot. Points are drawn as squares by default, and with size attenuation a particle
// that drifts near the camera balloons into a big orange block, so they use a fixed pixel size.
function useDotTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.35, "rgba(255,255,255,0.65)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }, []);
}

function Field({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const dot = useDotTexture();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.2 + Math.pow(Math.random(), 0.65) * 12;
      const a = Math.random() * Math.PI * 2;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 11;
      arr[i * 3 + 2] = Math.sin(a) * r - 4;
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.022;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={dot}
        size={3}
        color="#ff7a2f"
        transparent
        opacity={0.7}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={false}
      />
    </points>
  );
}

/**
 * The wireframe core. It only appears on slides that ask for it (see Stage.core): it grows in at the
 * requested spot, and shrinks away on the next slide that does not. Everything else is particles.
 */
function Core({ target }: { target: [number, number] | null }) {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Group>(null);
  const last = useRef<[number, number]>([6.5, 1]);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    if (target) last.current = target;
    const [tx, ty] = last.current;
    const k = Math.min(1, dt * 1.6);
    g.position.x += (tx - g.position.x) * k;
    g.position.y += (ty + Math.sin(t * 0.5) * 0.12 - g.position.y) * k;

    const goal = target ? 1 : 0.001;
    const s = g.scale.x + (goal - g.scale.x) * Math.min(1, dt * 2.4);
    g.scale.setScalar(s);
    g.visible = s > 0.02;

    g.rotation.y += dt * 0.18;
    g.rotation.x = Math.sin(t * 0.3) * 0.25;
    if (ring.current) {
      ring.current.rotation.z += dt * 0.06;
      ring.current.rotation.x = 0.9 + Math.sin(t * 0.25) * 0.18;
    }
  });

  return (
    <group ref={group} position={[6.5, 1, -3.5]} scale={0.001} visible={false}>
      <mesh>
        <icosahedronGeometry args={[1.05, 1]} />
        <meshBasicMaterial color="#fe6600" wireframe transparent opacity={0.3} />
      </mesh>
      <mesh scale={0.6}>
        <icosahedronGeometry args={[1.05, 0]} />
        <meshBasicMaterial color="#ffb27a" wireframe transparent opacity={0.22} />
      </mesh>
      <group ref={ring}>
        {[1.7, 2.3, 3.0].map((r, i) => (
          <mesh key={r} rotation={[0, 0, i * 0.7]}>
            <torusGeometry args={[r, 0.006, 8, 180]} />
            <meshBasicMaterial color={i === 1 ? "#fe6600" : "#ff9a52"} transparent opacity={0.36 - i * 0.09} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Rig({ scene }: { scene: number }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 0, -2));

  useFrame((state, dt) => {
    const k = Math.min(1, dt * 1.1);
    const tx = Math.sin(scene * 0.7) * 1.3 + state.pointer.x * 0.55;
    const ty = Math.cos(scene * 0.55) * 0.5 + state.pointer.y * 0.35;
    const tz = 7 - (scene % 5) * 0.32;
    camera.position.x += (tx - camera.position.x) * k;
    camera.position.y += (ty - camera.position.y) * k;
    camera.position.z += (tz - camera.position.z) * k;
    camera.lookAt(look.current);
  });

  return null;
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

export default function Backdrop({
  scene,
  core,
  calm = false,
}: {
  scene: number;
  core: [number, number] | null;
  calm?: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Warm glows give the particles something to sit in front of, even if WebGL is unavailable. */}
      <div className="absolute -left-[12%] top-[8%] h-[60vh] w-[60vh] rounded-full bg-brand/[0.13] blur-[120px]" />
      <div className="absolute -right-[10%] bottom-[2%] h-[55vh] w-[55vh] rounded-full bg-brand-deep/[0.12] blur-[130px]" />
      <Safe>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 7], fov: 52 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          frameloop={calm ? 'demand' : 'always'}
        >
          <Field count={calm ? 700 : 1700} />
          <Core target={core} />
          <Rig scene={scene} />
        </Canvas>
      </Safe>
    </div>
  );
}
