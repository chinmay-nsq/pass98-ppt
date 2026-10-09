"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { MousePointerClick } from "lucide-react";
import { SlideFrame } from "@/components/ui/SlideFrame";
import { Chip } from "@/components/ui/Glass";
import { cn } from "@/lib/cn";
import { TOTAL_FEATURES } from "@/lib/data";
import { gsap, SplitText, useGSAP, reducedMotion } from "@/lib/gsap";
import { FEET_FRACTION, makePose, resetPose } from "@/lib/pose";
import type { SlideProps } from "./types";

// The 3D mascot is only loaded here, on the cover, and only on screens that allow motion.
const MascotActor = dynamic(() => import("@/components/deck/MascotActor"), { ssr: false });

/**
 * The cover tells the name's story. It rests on the original word, "Passionate" (Pass + ionate),
 * and waits. When you click it (or press the next key), the Pass98 mascot hops in from the side,
 * leaps onto the word, and stomps "ionate" letter by letter while the word vibrates harder and
 * harder. Then he winds up, springs high into the air and slams down in the middle: the letters
 * burst apart, "98" pops up where he landed, the word closes around it, and he hops onto the new
 * word to celebrate. Final word: Pass98.
 *
 * The mascot model is a single fused mesh with no skeleton, so it is animated as a whole body
 * (jump arcs, squash and stretch, spins) through the shared `pose` object; see lib/pose.ts.
 *
 * The reveal is the cover's one build step, so the deck's own navigation drives it too: going
 * back from the next slide lands on the finished word, and stepping back replays from the start.
 */
const OLD_NAME = "ionate";
const NEW_NAME = "98";
const SPARKS = 50;
const FX = 28;
const RINGS = 4;

type Phase = "idle" | "playing" | "done";
type Point = { x: number; y: number };
interface Api {
  play: () => void;
  reset: () => void;
  onActorReady: () => void;
  onActorFail: () => void;
}

export default function Cover({ step, next }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  const api = useRef<Api | null>(null);
  const stepRef = useRef(step);
  stepRef.current = step;

  // The shared pose the 3D puppet obeys (see lib/pose.ts).
  const pose = useRef(makePose()).current;
  const canActRef = useRef(false);
  const actorReadyRef = useRef(false);
  const [canAct, setCanAct] = useState(false);

  useEffect(() => {
    const ok = !reducedMotion();
    canActRef.current = ok;
    setCanAct(ok);
  }, []);

  const onActorReady = useCallback(() => {
    actorReadyRef.current = true;
    api.current?.onActorReady();
  }, []);
  const onActorFail = useCallback(() => api.current?.onActorFail(), []);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = <T extends HTMLElement>(sel: string) => el.querySelector<T>(sel)!;
      const all = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, el);
      const h1 = q("[data-title]");
      const pass = q("[data-pass]");
      const slot = q("[data-slot]");
      const oldEl = q("[data-old]");
      const newEl = q("[data-new]");
      const baseEl = q("[data-baseline]");
      const flash = q("[data-flash]");
      const actor = q("[data-actor]");
      const shadow = q("[data-shadow]");
      const sparks = all("[data-spark]");
      const fxs = all("[data-fx]");
      const rings = all("[data-ring]");

      const wOld = oldEl.offsetWidth;
      const wNew = newEl.offsetWidth;
      const fs = parseFloat(getComputedStyle(h1).fontSize);
      const startAtEnd = stepRef.current >= 1 || reducedMotion();
      const rnd = gsap.utils.random;

      // The mascot's canvas box. His soles sit at FEET_FRACTION of its height.
      const H = Math.round(gsap.utils.clamp(190, 320, window.innerHeight * 0.3));
      const W = Math.round(H * 0.78);
      gsap.set(actor, { width: W, height: H, x: -9999, y: 0, opacity: 0 });

      // Where "ionate" sits, relative to the heading: the middle of the old suffix.
      const hitX = slot.offsetLeft + wOld / 2;
      const hitY = slot.offsetTop + slot.offsetHeight / 2;
      gsap.set([flash, ...sparks], { left: hitX, top: hitY, opacity: 0 });

      const passChars = SplitText.create(pass, { type: "chars" }).chars;
      const oldChars = SplitText.create(oldEl, { type: "chars" }).chars;
      // background-clip text is lost on transformed children, so each letter carries the gradient.
      oldChars.forEach((c) => c.classList.add("tg-word"));
      // Letters stand on their baseline, so squash and shake pivot there.
      gsap.set(oldChars, { transformOrigin: "50% 100%" });

      const ARRIVED = { opacity: 1, x: 0, y: 0, scale: 1, skewX: 0, filter: "blur(0px)" };
      const HIDDEN_NEW = { opacity: 0, x: 0, y: 70, scale: 0.25, skewX: 0, filter: "blur(14px)" };

      let phase: Phase = startAtEnd ? "done" : "idle";
      let timeline: gsap.core.Timeline | null = null;
      let idle: gsap.core.Tween | null = null;
      let sparkIndex = 0;
      let fxIndex = 0;
      let ringIndex = 0;
      let wantPlay = false;
      let waited = false;
      let actorFailed = false;

      // ── Geometry, measured fresh each time because the word changes width ────────────────
      const measure = () => {
        const rr = el.getBoundingClientRect();
        const base = baseEl.getBoundingClientRect().top - rr.top;
        return {
          rr,
          base,
          letters: oldChars.map((c) => {
            const r = c.getBoundingClientRect();
            return r.left - rr.left + r.width / 2;
          }),
          viewRight: window.innerWidth - rr.left,
          ground: base + 0.1 * fs, // just under the word
          letterPlane: base - 0.4 * fs, // the tops of lowercase letters
          digitPlane: base - 0.7 * fs, // the tops of the numerals
        };
      };

      // ── The mascot's feet are the single source of truth; the DOM follows them ───────────
      const feet = { x: 0, y: 0, ground: 0 };
      const apply = () => {
        gsap.set(actor, { x: feet.x - W / 2, y: feet.y - FEET_FRACTION * H });
        const lift = Math.max(0, feet.ground - feet.y);
        gsap.set(shadow, {
          x: feet.x - 56,
          y: feet.ground - 8,
          scaleX: 1 / (1 + lift / 140),
          opacity: actorReadyRef.current ? 0.6 / (1 + lift / 90) : 0,
        });
      };

      // Dust, sparks and a shock ring where he lands.
      const landFx = (x: number, y: number, power = 1) => {
        for (let k = 0; k < 8; k++) {
          const s = fxs[fxIndex++ % fxs.length];
          gsap.fromTo(
            s,
            { left: x, top: y, x: 0, y: 0, opacity: 1, scale: rnd(0.6, 1.3) },
            { x: rnd(-110, 110) * power, y: -rnd(30, 120) * power, opacity: 0, scale: 0, duration: rnd(0.35, 0.75), ease: "power2.out", overwrite: true },
          );
        }
        const ring = rings[ringIndex++ % rings.length];
        gsap.fromTo(
          ring,
          { left: x, top: y, scaleX: 0.2, scaleY: 0.06, opacity: 0.9 },
          { scaleX: 1.6 * power, scaleY: 0.5 * power, opacity: 0, duration: 0.55, ease: "power2.out", overwrite: true },
        );
      };

      // A spark off a random spot on the word while it is being stomped.
      const emitSpark = () => {
        const s = sparks[sparkIndex++ % sparks.length];
        gsap.fromTo(
          s,
          { x: rnd(-wOld / 2, wOld / 2), y: rnd(-60, 60), opacity: 1, scale: rnd(0.5, 1.2) },
          { x: `+=${rnd(-70, 70)}`, y: `-=${rnd(40, 130)}`, opacity: 0, scale: 0, duration: rnd(0.35, 0.7), ease: "power2.out", overwrite: true },
        );
      };

      // A letter gets squashed flat under his feet and springs back.
      const squashLetter = (i: number) => {
        gsap.fromTo(
          oldChars[i],
          { scaleY: 0.64, scaleX: 1.14 },
          { scaleY: 1, scaleX: 1, duration: 0.55, ease: "elastic.out(1,0.32)", overwrite: "auto" },
        );
      };

      // ── The puppet's jump: crouch, arc through the air with stretch, land with a squash ───
      const hop = (
        tl: gsap.core.Timeline,
        to: Point | (() => Point),
        o: { h: number; d: number; crouch?: number; spin?: number; label?: string; onLand?: () => void },
      ) => {
        const t = { p: 0 };
        let from: Point = { x: 0, y: 0 };
        let dest: Point = { x: 0, y: 0 };
        const crouch = o.crouch ?? 0.09;

        tl.to(pose, { sy: 0.8, sx: 1.14, duration: crouch, ease: "power2.out" });
        tl.to(t, {
          p: 1,
          duration: o.d,
          ease: "none",
          onStart: () => {
            from = { x: feet.x, y: feet.ground };
            dest = typeof to === "function" ? to() : to;
          },
          onUpdate: () => {
            const p = t.p;
            feet.x = from.x + (dest.x - from.x) * p;
            feet.ground = from.y + (dest.y - from.y) * p;
            feet.y = feet.ground - 4 * o.h * p * (1 - p);
            const v = Math.abs(1 - 2 * p); // 1 at take-off and landing, 0 at the top
            const blend = Math.min(1, p / 0.15);
            pose.sy = gsap.utils.interpolate(0.8, 1 + 0.17 * v, blend);
            pose.sx = gsap.utils.interpolate(1.14, 1 - 0.08 * v, blend);
            if (o.spin) pose.yaw = o.spin * (p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2);
            apply();
          },
          onComplete: () => {
            feet.x = dest.x;
            feet.y = feet.ground = dest.y;
            if (o.spin) pose.yaw = 0;
            apply();
          },
        });
        if (o.label) tl.add(o.label);
        tl.call(() => o.onLand?.());
        tl.to(pose, { sy: 0.7, sx: 1.22, duration: 0.05, ease: "power2.in" });
        tl.to(pose, { sy: 1, sx: 1, duration: 0.16, ease: "back.out(3)" });
      };

      // ── States ─────────────────────────────────────────────────────────────────────────
      const hideActor = () => {
        gsap.set(actor, { x: -9999, opacity: 0 });
        gsap.set(shadow, { opacity: 0 });
      };

      // The finished word, with no animation, for when the slide opens already revealed.
      const showFinal = () => {
        slot.style.width = `${wNew}px`;
        gsap.set([pass, ...passChars], { opacity: 1, yPercent: 0 });
        gsap.set(oldEl, { display: "none" });
        gsap.set(newEl, ARRIVED);
        gsap.set([flash, ...sparks], { opacity: 0 });
        if (reducedMotion()) return;
        // Once the page has settled, the mascot is already standing on top of "98".
        gsap.delayedCall(0.9, () => {
          if (phase !== "done") return;
          const m = measure();
          const r = newEl.getBoundingClientRect();
          feet.x = r.left - m.rr.left + r.width * 0.45;
          feet.y = feet.ground = m.digitPlane;
          gsap.set(actor, { opacity: 1 });
          apply();
          gsap.set(shadow, { opacity: 0 });
          idle?.kill();
          idle = gsap.to(pose, { sy: 1.03, sx: 0.985, duration: 1.2, yoyo: true, repeat: -1, ease: "sine.inOut" });
        });
      };

      // The resting word: "Passionate".
      const showRest = () => {
        slot.style.width = `${wOld}px`;
        gsap.set(oldEl, { clearProps: "display,filter", opacity: 1 });
        // Reset only what the animation touches. Clearing everything would also strip the
        // inline-block display SplitText gives each letter, and the word would stack vertically.
        gsap.set(oldChars, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, yPercent: 0 });
        gsap.set(h1, { x: 0, y: 0, scale: 1 });
        gsap.set(newEl, HIDDEN_NEW);
        gsap.set([flash, ...sparks, ...fxs, ...rings], { opacity: 0 });
        idle?.kill();
        idle = null;
        resetPose(pose);
        hideActor();
      };

      // ── The story ──────────────────────────────────────────────────────────────────────
      const play = () => {
        if (phase !== "idle") return;
        // Give the 3D model a moment to load; if it never does, tell the story without him.
        if (canActRef.current && !actorReadyRef.current && !actorFailed && !waited) {
          wantPlay = true;
          gsap.delayedCall(2.5, () => {
            waited = true;
            if (wantPlay) {
              wantPlay = false;
              play();
            }
          });
          return;
        }
        phase = "playing";

        const m = measure();
        const amp = { v: 0.1 };
        const last = oldChars.length - 1;
        const tl = gsap.timeline({ onComplete: () => void (phase = "done") });
        timeline = tl;

        // He starts off-screen to the right, standing on the ground line.
        feet.x = m.viewRight + W;
        feet.y = feet.ground = m.ground;
        gsap.set(actor, { opacity: 1 });
        apply();

        // 1. Two hops in from the side...
        hop(tl, { x: m.viewRight - W * 0.6, y: m.ground }, { h: 70, d: 0.42 });
        hop(tl, { x: m.letters[last] + 170, y: m.ground }, { h: 60, d: 0.38, crouch: 0.07 });

        // 2. ...then a leap onto the last letter. The fight begins.
        hop(tl, { x: m.letters[last], y: m.letterPlane }, {
          h: 150,
          d: 0.5,
          label: "fightStart",
          onLand: () => {
            squashLetter(last);
            landFx(feet.x, feet.y, 1.2);
          },
        });

        // 3. He stomps his way along "ionate", right to left. Every stomp squashes a letter.
        for (let i = last - 1; i >= 0; i--) {
          hop(tl, { x: m.letters[i], y: m.letterPlane }, {
            h: 46,
            d: 0.22,
            crouch: 0.06,
            onLand: () => {
              squashLetter(i);
              landFx(feet.x, feet.y, 0.8 + (last - i) * 0.12);
              gsap.fromTo(h1, { y: 0 }, { y: 6, duration: 0.05, yoyo: true, repeat: 1, ease: "power1.out" });
            },
          });
        }

        // 4. Wind-up: he crouches low while the word shakes at full strength.
        tl.to(pose, { sy: 0.55, sx: 1.34, duration: 0.35, ease: "power2.out" });

        // 5. The big jump: high into the air with two full spins, and down into the middle.
        hop(tl, () => ({ x: (m.letters[2] + m.letters[3]) / 2, y: m.letterPlane }), {
          h: 300,
          d: 0.95,
          crouch: 0.02,
          spin: Math.PI * 4,
          label: "hit",
          onLand: () => landFx(feet.x, feet.y, 2.2),
        });

        // 6. Impact: "ionate" bursts apart, the word shakes, a flash and sparks, and "98" pops up
        //    where he landed while the word closes up around it.
        tl.to(
          oldChars,
          {
            x: () => rnd(-720, 720),
            y: () => rnd(-420, 420),
            rotation: () => rnd(-520, 520),
            opacity: 0,
            scale: () => rnd(0.2, 0.7),
            duration: 1.1,
            ease: "power3.out",
            overwrite: true,
          },
          "hit",
        );
        tl.to(oldEl, { filter: "brightness(1)", duration: 0.1 }, "hit");
        tl.fromTo(
          h1,
          { x: 0, y: 0 },
          {
            x: () => rnd(-18, 18),
            y: () => rnd(-11, 11),
            duration: 0.045,
            repeat: 13,
            yoyo: true,
            ease: "none",
            immediateRender: false,
            onComplete: () => void gsap.set(h1, { x: 0, y: 0 }),
          },
          "hit",
        );
        tl.fromTo(
          flash,
          { scale: 0.15, opacity: 0.95 },
          { scale: 3, opacity: 0, duration: 1, ease: "power2.out", immediateRender: false },
          "hit",
        );
        sparks.forEach((s, i) => {
          const a = (i / SPARKS) * Math.PI * 2 + rnd(-0.2, 0.2);
          const d = rnd(130, 420);
          tl.fromTo(
            s,
            { x: 0, y: 0, opacity: 1, scale: rnd(0.7, 1.7) },
            { x: Math.cos(a) * d, y: Math.sin(a) * d * 0.7, opacity: 0, scale: 0, duration: rnd(0.6, 1.2), ease: "power3.out", immediateRender: false, overwrite: true },
            "hit",
          );
        });
        tl.to(newEl, { ...ARRIVED, duration: 0.6, ease: "back.out(2.4)" }, "hit+=0.05");
        tl.to(slot, { width: wNew, duration: 0.75, ease: "back.out(1.7)" }, "hit+=0.2");
        tl.to(h1, { scale: 1.045, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 1 }, "hit+=0.55");

        // 7. Victory: he hops onto the new word, spins once, and settles on top of it.
        hop(
          tl,
          () => {
            const mm = measure();
            const r = newEl.getBoundingClientRect();
            return { x: r.left - mm.rr.left + r.width * 0.45, y: mm.digitPlane };
          },
          { h: 130, d: 0.65, spin: Math.PI * 2, onLand: () => landFx(feet.x, feet.y, 1.3) },
        );
        tl.call(() => {
          gsap.to(shadow, { opacity: 0, duration: 0.3 });
          idle?.kill();
          idle = gsap.to(pose, { sy: 1.03, sx: 0.985, duration: 1.2, yoyo: true, repeat: -1, ease: "sine.inOut" });
        });

        // The fight: from the first landing to the slam, the word shakes harder and harder.
        tl.to(
          amp,
          {
            v: 1,
            duration: tl.labels.hit - tl.labels.fightStart,
            ease: "power2.in",
            onUpdate: () => {
              const a = amp.v;
              oldChars.forEach((c) =>
                gsap.set(c, { x: rnd(-1, 1) * a * 16, y: rnd(-1, 1) * a * 13, rotation: rnd(-1, 1) * a * 16 }),
              );
              gsap.set(oldEl, { filter: `brightness(${1 + a * 0.6})` });
              if (Math.random() < a * 0.45) emitSpark();
            },
          },
          "fightStart",
        );
      };

      // Stepping back from the revealed cover replays the story from "Passionate".
      const reset = () => {
        if (phase === "idle" && !wantPlay) return;
        wantPlay = false;
        timeline?.kill();
        timeline = null;
        gsap.killTweensOf([h1, ...oldChars, ...sparks, ...fxs, ...rings, flash, newEl, slot, oldEl, pose, shadow, actor]);
        showRest();
        phase = "idle";
      };

      api.current = {
        play,
        reset,
        onActorReady: () => {
          if (wantPlay) {
            wantPlay = false;
            play();
          }
        },
        onActorFail: () => {
          actorFailed = true;
          if (wantPlay) {
            wantPlay = false;
            play();
          }
        },
      };

      // ── First paint ────────────────────────────────────────────────────────────────────
      gsap.set(pass, { opacity: 1 });
      if (startAtEnd) {
        showFinal();
      } else {
        showRest();
        // "Passionate" rises in letter by letter, then simply waits for the click.
        gsap.set([...passChars, ...oldChars], { opacity: 0, yPercent: 90 });
        gsap.to([...passChars, ...oldChars], {
          opacity: 1,
          yPercent: 0,
          duration: 0.9,
          stagger: 0.07,
          delay: 0.5,
          ease: "expo.out",
        });
      }

      return () => {
        api.current = null;
        timeline?.kill();
        idle?.kill();
      };
    },
    { scope: root },
  );

  // The deck's build step drives the reveal: step 1 plays it, going back to step 0 resets it.
  useEffect(() => {
    if (step >= 1) api.current?.play();
    else api.current?.reset();
  }, [step]);

  const revealed = step >= 1;

  return (
    <SlideFrame center bodyClassName="flex flex-col items-center justify-center">
      <p data-in="fade" className="eyebrow mb-6">
        Product deck · October 2026
      </p>

      <div
        ref={root}
        className="relative"
        onClick={() => {
          if (!revealed) next?.();
        }}
      >
        <h1
          data-title
          aria-label={revealed ? "Pass98" : "Passionate"}
          title={revealed ? undefined : "Click to reveal the name"}
          className={cn(
            "title-xl relative whitespace-nowrap text-[clamp(3.2rem,15vw,14rem)] leading-[0.86] tracking-[-0.055em] select-none",
            !revealed && "cursor-pointer transition-[filter] duration-300 hover:[filter:drop-shadow(0_0_34px_rgb(254_102_0/0.4))]",
          )}
        >
          <span data-pass aria-hidden className="inline-block opacity-0">
            Pass
          </span>
          <span data-slot aria-hidden className="inline-grid align-baseline">
            <span
              data-old
              className="inline-block justify-self-start text-transparent opacity-0"
              style={{ gridArea: "1 / 1" }}
            >
              {OLD_NAME}
            </span>
            <span
              data-new
              className="text-gradient inline-block justify-self-start pr-[0.09em] opacity-0"
              style={{ gridArea: "1 / 1" }}
            >
              {NEW_NAME}
            </span>
          </span>
          {/* Zero-size marker whose top edge is exactly the text baseline, used to place his feet. */}
          <span data-baseline aria-hidden className="inline-block size-0 align-baseline" />
        </h1>

        {/* Stage effects, positioned in JS over the word. */}
        <div
          data-flash
          aria-hidden
          className="pointer-events-none absolute size-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
          style={{
            background:
              "radial-gradient(circle, rgba(255,190,120,0.95), rgba(254,102,0,0.35) 38%, transparent 68%)",
          }}
        />
        {Array.from({ length: SPARKS }, (_, i) => (
          <span
            key={i}
            data-spark
            aria-hidden
            className="pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-soft opacity-0 shadow-[0_0_14px_#fe6600]"
          />
        ))}

        {/* The mascot's contact shadow, the character, and his landing effects. */}
        <div
          data-shadow
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-10 h-4 w-28 rounded-full opacity-0"
          style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.7), transparent 70%)" }}
        />
        <div data-actor aria-hidden className="pointer-events-none absolute left-0 top-0 z-20 opacity-0">
          {canAct && <MascotActor pose={pose} onReady={onActorReady} onFail={onActorFail} />}
        </div>
        {Array.from({ length: FX }, (_, i) => (
          <span
            key={i}
            data-fx
            aria-hidden
            className="pointer-events-none absolute z-30 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber opacity-0 shadow-[0_0_10px_#ffb020]"
          />
        ))}
        {Array.from({ length: RINGS }, (_, i) => (
          <span
            key={i}
            data-ring
            aria-hidden
            className="pointer-events-none absolute z-10 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand/80 opacity-0"
          />
        ))}
      </div>

      <p
        data-in
        data-delay="1.1"
        className="lede mx-auto mt-8 max-w-[34ch] text-center text-[clamp(1.1rem,2vw,1.7rem)] text-ink/85"
      >
        The AI interview gym. Practice live, get scored, level up.
      </p>

      <div data-in data-delay="1.3" className="mt-9 flex flex-wrap items-center justify-center gap-2.5">
        <Chip tone="brand">{TOTAL_FEATURES} features</Chip>
        <Chip>4 personas</Chip>
        <Chip>Web · iOS · Android</Chip>
      </div>

      <p
        data-in="fade"
        data-delay="1.8"
        className="mono mt-12 flex animate-pulse-soft items-center gap-2.5 text-xs tracking-[0.3em] text-faint"
      >
        {revealed ? (
          "PRESS → TO BEGIN"
        ) : (
          <>
            <MousePointerClick className="size-4 text-brand" /> CLICK THE WORD
          </>
        )}
      </p>
    </SlideFrame>
  );
}
