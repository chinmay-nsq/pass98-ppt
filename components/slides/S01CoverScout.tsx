"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { MousePointerClick } from "lucide-react";
import { SlideFrame } from "@/components/ui/SlideFrame";
import { Chip } from "@/components/ui/Glass";
import { cn } from "@/lib/cn";
import { TOTAL_FEATURES } from "@/lib/data";
import { gsap, SplitText, useGSAP, reducedMotion } from "@/lib/gsap";
import {
  CHAMBER,
  CROUCH,
  DROP,
  FACE_LEFT,
  FALL,
  FLEX,
  KICK_FACE,
  KICK_FLY,
  LAND,
  LOOK_UP,
  LOOPS,
  LUNGE,
  P,
  PROUD,
  PUSH,
  TUCK,
  copyPose,
  idle,
  mixPose,
  squat,
  strain,
  walk,
  type Pose,
} from "@/lib/scoutPose";
import type { ScoutMove } from "@/lib/coverVariant";
import type { ScoutApi } from "@/components/deck/ScoutStage";
import { FEET_FRACTION, VIEW_H } from "@/components/deck/ScoutStage";
import type { SlideProps } from "./types";

// three.js and the 7.9 MB model load only when this version of the cover is shown.
const ScoutStage = dynamic(() => import("@/components/deck/ScoutStage"), { ssr: false });

/**
 * Cover, Scout versions. It rests on "Passionate". On click (or the next key) the Orange Scout turns
 * "ionate" into "98" with one of three moves, then flexes and settles beside the new word:
 *  - push:  walks in from the right, plants both hands on the "e" and pushes "ionate" to the left;
 *           the letters bunch up and shake, then pop, and "98" is left where they were.
 *  - stomp: drops from the top of the screen onto "ionate" and squashes it flat with a shockwave;
 *           he hops off and the flattened letters spring back up as "98".
 *  - kick:  sprints in from the right and flying-kicks the "e"; the letters are bowled off the
 *           screen, then "9" and "8" fall from the sky and slam into place.
 *
 * The reveal is the cover's one build step, like the classic version: going back from the next
 * slide lands on the finished word, and stepping back replays from the start.
 */
const OLD_NAME = "ionate";
const NEW_NAME = "98";
const SPARKS = 50;

type Phase = "idle" | "waiting" | "playing" | "done";

export default function CoverScout({ step, next, move = "push" }: SlideProps & { move?: ScoutMove }) {
  const stage = useRef<HTMLDivElement>(null);
  const api = useRef<{ play: () => void; reset: () => void; scoutReady: (s: ScoutApi | null) => void } | null>(null);
  const stepRef = useRef(step);
  stepRef.current = step;

  const pose = useRef<Pose>(P({ rootRot: FACE_LEFT })).current;
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const scoutRef = useRef<ScoutApi | null>(null);
  const failed = useRef(false);

  const onReady = useCallback((s: ScoutApi) => {
    scoutRef.current = s;
    api.current?.scoutReady(s);
  }, []);
  const onFail = useCallback(() => {
    failed.current = true;
    api.current?.scoutReady(null);
  }, []);

  useGSAP(
    () => {
      const el = stage.current;
      if (!el) return;
      const q = <T extends HTMLElement>(sel: string) => el.querySelector<T>(sel)!;
      const h1 = q("[data-title]");
      const pass = q("[data-pass]");
      const slot = q("[data-slot]");
      const oldEl = q("[data-old]");
      const newEl = q("[data-new]");
      const digits = gsap.utils.toArray<HTMLElement>("[data-digit]", el);
      const baseEl = q("[data-baseline]");
      const flash = q("[data-flash]");
      const actor = q("[data-actor]");
      const shadow = q("[data-shadow]");
      const sparks = gsap.utils.toArray<HTMLElement>("[data-spark]", el);

      const rnd = gsap.utils.random;
      const fs = parseFloat(getComputedStyle(h1).fontSize);
      const wOld = oldEl.offsetWidth;
      const wNew = newEl.offsetWidth;
      const ratio = wNew / wOld;
      const startAtEnd = stepRef.current >= 1 || reducedMotion();
      const motionOk = !reducedMotion();

      // He stands about 1.25 cap heights tall next to the word.
      const ppu = 0.66 * fs;
      const H = Math.round(VIEW_H * ppu);
      const W = Math.round(H * 0.95);
      if (motionOk) setBox({ w: W, h: H });

      const passChars = SplitText.create(pass, { type: "chars" }).chars;
      const oldChars = SplitText.create(oldEl, { type: "chars" }).chars;
      oldChars.forEach((c) => c.classList.add("tg-word"));
      gsap.set(oldChars, { transformOrigin: "50% 100%" });

      let phase: Phase = startAtEnd ? "done" : "idle";
      let timeline: gsap.core.Timeline | null = null;
      let life: (() => void) | null = null;
      let sparkIndex = 0;

      // ── Geometry (stage coordinates; measured fresh because the word changes width) ─────
      const measure = () => {
        const rr = el.getBoundingClientRect();
        const slotR = slot.getBoundingClientRect();
        return {
          left: slotR.left - rr.left, // where "ionate" starts
          ground: baseEl.getBoundingClientRect().top - rr.top,
          viewRight: window.innerWidth - rr.left,
          letterCenters: oldChars.map((c) => {
            const r = c.getBoundingClientRect();
            return r.left - rr.left + r.width / 2 - (gsap.getProperty(c, "x") as number);
          }),
          newRight: () => newEl.getBoundingClientRect().right - rr.left,
        };
      };

      const feet = { x: -9999, y: 0 };
      // The surface under him while he is in the air (NaN: wherever his feet are).
      const surf = { y: NaN };
      const place = () => {
        gsap.set(actor, { x: feet.x - W / 2, y: feet.y - FEET_FRACTION * H });
        const gy = Number.isNaN(surf.y) ? feet.y : surf.y;
        const lift = Math.max(0, gy - feet.y) / ppu;
        gsap.set(shadow, { x: feet.x - 0.45 * ppu, y: gy - 6, width: 0.9 * ppu, scale: 1 / (1 + lift * 0.9) });
      };

      // Height of a lowercase letter, so he can stand on top of "ionate".
      const xHeight = () => {
        try {
          const ctx = document.createElement("canvas").getContext("2d")!;
          const cs = getComputedStyle(h1);
          ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
          const a = ctx.measureText("n").actualBoundingBoxAscent;
          if (a > 0) return a;
        } catch {}
        return 0.52 * fs;
      };

      // Squash and stretch letters about the text baseline, not the bottom of their boxes.
      const originAtBaseline = (els: Element[]) => {
        const base = baseEl.getBoundingClientRect().top;
        els.forEach((e) => {
          const top = e.getBoundingClientRect().top - (gsap.getProperty(e, "y") as number);
          gsap.set(e, { transformOrigin: `50% ${base - top}px` });
        });
      };

      // Where his feet end up: just right of "98", once the word has closed up around it. The title
      // is centred and moves as it shrinks, so the final layout is measured by trying it out.
      const finalX = (m: ReturnType<typeof measure>) => {
        const prev = slot.style.width;
        slot.style.width = `${wNew}px`;
        const right = slot.getBoundingClientRect().right - el.getBoundingClientRect().left;
        slot.style.width = prev;
        return Math.min(right + 0.5 * ppu, m.viewRight - W / 2);
      };

      // Where his feet go so that the front of his hands touches `edge` in this pose.
      const feetForHands = (edge: number, p: Pose) => {
        const s = scoutRef.current;
        const reach = s ? s.measureHands(p).x : -0.5 * ppu;
        return edge - reach;
      };

      const spark = (x: number, y: number, spread = 1) => {
        const s = sparks[sparkIndex++ % sparks.length];
        gsap.fromTo(
          s,
          { left: x, top: y, x: 0, y: 0, opacity: 1, scale: rnd(0.5, 1.2) },
          { x: rnd(-40, 70) * spread, y: -rnd(30, 110) * spread, opacity: 0, scale: 0, duration: rnd(0.35, 0.7), ease: "power2.out", overwrite: true },
        );
      };

      const startLife = (base: Pose) => {
        life?.();
        const t0 = performance.now();
        const tick = () => copyPose(pose, idle(base, (performance.now() - t0) / 1000));
        gsap.ticker.add(tick);
        life = () => gsap.ticker.remove(tick);
      };

      // ── States ────────────────────────────────────────────────────────────────────
      const finalSpot = () => {
        const m = measure();
        return { x: Math.min(m.newRight() + 0.42 * ppu, m.viewRight - W / 2), y: m.ground };
      };

      const showFinal = () => {
        slot.style.width = `${wNew}px`;
        gsap.set([pass, ...passChars], { opacity: 1, yPercent: 0 });
        gsap.set(oldEl, { display: "none" });
        gsap.set(newEl, { opacity: 1, scale: 1, x: 0 });
        gsap.set(digits, { y: 0, scaleX: 1, scaleY: 1, opacity: 1 });
        gsap.set([flash, ...sparks], { opacity: 0 });
        if (!motionOk) return;
        // Once he has loaded and the layout has settled, he is already standing beside "98".
        gsap.delayedCall(0.8, () => {
          if (phase !== "done") return;
          const s = finalSpot();
          feet.x = s.x;
          feet.y = s.y;
          surf.y = NaN;
          place();
          copyPose(pose, PROUD);
          gsap.set([actor, shadow], { opacity: 1 });
          startLife(PROUD);
        });
      };

      const showRest = () => {
        life?.();
        life = null;
        slot.style.width = `${wOld}px`;
        gsap.set(oldEl, { clearProps: "display,filter", opacity: 1 });
        gsap.set(oldChars, { x: 0, y: 0, rotation: 0, scale: 1, scaleX: 1, scaleY: 1, opacity: 1, yPercent: 0 });
        gsap.set(h1, { x: 0, y: 0, scale: 1 });
        gsap.set(newEl, { opacity: 0, scale: 0.3, x: 0 });
        gsap.set(digits, { y: 0, scaleX: 1, scaleY: 1, opacity: 1 });
        gsap.set(passChars, { y: 0 });
        gsap.set([flash, ...sparks], { opacity: 0 });
        gsap.set([actor, shadow], { opacity: 0 });
        copyPose(pose, P({ rootRot: FACE_LEFT }));
        feet.x = -9999;
        surf.y = NaN;
        place();
      };

      // Tween the pose from whatever it is at the time to `to`.
      const poseTo = (tl: gsap.core.Timeline, to: Pose, duration: number, ease = "power2.inOut", position?: gsap.Position) => {
        const from = P();
        const k = { v: 0 };
        tl.to(
          k,
          {
            v: 1,
            duration,
            ease,
            onStart: () => copyPose(from, pose),
            onUpdate: () => mixPose(pose, from, to, k.v),
          },
          position,
        );
      };

      // ── The story ───────────────────────────────────────────────────────────────────
      const play = () => {
        if (phase === "playing" || phase === "done") return;
        // Wait for the model (it is large); if it never arrives, play without him.
        if (motionOk && !scoutRef.current && !failed.current) {
          phase = "waiting";
          gsap.delayedCall(4, () => {
            if (phase === "waiting") {
              failed.current = true;
              run();
            }
          });
          return;
        }
        run();
      };

      const run = () => {
        phase = "playing";
        const withScout = motionOk && !!scoutRef.current && !failed.current;
        const tl = gsap.timeline({ onComplete: () => void (phase = "done") });
        timeline = tl;
        if (move === "stomp") stomp(tl, withScout);
        else if (move === "kick") kick(tl, withScout);
        else push(tl, withScout);
      };

      // ── Push ────────────────────────────────────────────────────────────────────────
      const push = (tl: gsap.core.Timeline, withScout: boolean) => {
        const m = measure();
        const shrink = 1 - ratio; // how much of the word's width is pushed away
        const rightEdge = (p: number) => m.left + wOld * (1 - p * shrink);
        gsap.set(newEl, { transformOrigin: "50% 50%" });

        // 1. He walks in from the right edge of the screen to the "e".
        const contact0 = feetForHands(rightEdge(0), PUSH);
        if (withScout) {
          feet.y = m.ground;
          feet.x = m.viewRight + W * 0.6;
          place();
          gsap.set([actor, shadow], { opacity: 1 });
          const stride = 0.38 * ppu;
          const dist = feet.x - contact0;
          const walkT = { d: 0 };
          const startX = feet.x;
          tl.to(walkT, {
            d: dist,
            duration: Math.max(1.1, dist / (1.5 * ppu)),
            ease: "none",
            onUpdate: () => {
              feet.x = startX - walkT.d;
              copyPose(pose, walk(walkT.d / stride));
              place();
            },
          });
          // 2. Plants both hands on the letter.
          poseTo(tl, PUSH, 0.32, "power2.out");
        }
        tl.add("push");

        // 3. The push: "ionate" is squeezed to the left, the letters bunch up and shake harder,
        //    and he follows the right edge, legs driving.
        const prog = { p: 0 };
        const PUSH_S = 1.7;
        const t0 = { v: 0 };
        tl.to(
          prog,
          {
            p: 1,
            duration: PUSH_S,
            ease: "power1.inOut",
            onStart: () => void (t0.v = performance.now()),
            onUpdate: () => {
              const p = prog.p;
              const k = 1 - p * shrink;
              const jitter = 2 + p * 9;
              oldChars.forEach((c, i) => {
                const cx = m.letterCenters[i];
                gsap.set(c, {
                  x: (cx - m.left) * (k - 1) + rnd(-1, 1) * jitter,
                  y: rnd(-1, 1) * jitter * 0.6,
                  scaleX: 1 - p * shrink * 0.55,
                  scaleY: 1 + p * 0.08,
                  rotation: rnd(-1, 1) * p * 6,
                });
              });
              gsap.set(oldEl, { filter: `brightness(${1 + p * 0.5})` });
              if (withScout) {
                const t = (performance.now() - t0.v) / 1000;
                const sp = strain(t, p);
                copyPose(pose, sp);
                feet.x = feetForHands(rightEdge(p), PUSH) + Math.sin(t * 9) * 0.01 * ppu;
                place();
                if (Math.random() < 0.18 + p * 0.3) spark(rightEdge(p), m.ground - 0.35 * fs, 0.8);
              } else if (Math.random() < p * 0.3) {
                spark(rightEdge(p), m.ground - 0.35 * fs, 0.8);
              }
            },
          },
          "push",
        );

        // 4. Peak pressure: everything shakes at full strength for a moment.
        const hold = { v: 0 };
        const holdStart = { t: 0 };
        tl.to(hold, {
          v: 1,
          duration: 0.45,
          onStart: () => void (holdStart.t = performance.now()),
          onUpdate: () => {
            const k = 1 - shrink;
            oldChars.forEach((c, i) => {
              const cx = m.letterCenters[i];
              gsap.set(c, { x: (cx - m.left) * (k - 1) + rnd(-1, 1) * 13, y: rnd(-1, 1) * 9, rotation: rnd(-1, 1) * 10 });
            });
            if (withScout) {
              copyPose(pose, strain(PUSH_S + (performance.now() - holdStart.t) / 1000, 1));
              place();
            }
            if (Math.random() < 0.5) spark(rightEdge(1) - rnd(0, wNew), m.ground - rnd(0.1, 0.6) * fs, 1);
          },
        });
        tl.add("pop");

        // 5. Pop: the squeezed letters burst, a flash, and "98" is standing where they were.
        const popX = m.left + wNew / 2;
        const popY = m.ground - 0.4 * fs;
        tl.set(flash, { left: popX, top: popY }, "pop");
        tl.to(
          oldChars,
          {
            x: () => rnd(-650, 120),
            y: () => rnd(-420, 380),
            rotation: () => rnd(-520, 520),
            opacity: 0,
            scale: () => rnd(0.2, 0.6),
            duration: 1.05,
            ease: "power3.out",
            overwrite: true,
          },
          "pop",
        );
        tl.to(oldEl, { filter: "brightness(1)", duration: 0.1 }, "pop");
        tl.fromTo(flash, { scale: 0.15, opacity: 0.95 }, { scale: 2.6, opacity: 0, duration: 0.9, ease: "power2.out", immediateRender: false }, "pop");
        sparks.forEach((s, i) => {
          const a = (i / SPARKS) * Math.PI * 2 + rnd(-0.2, 0.2);
          const d = rnd(110, 360);
          tl.fromTo(
            s,
            { left: popX, top: popY, x: 0, y: 0, opacity: 1, scale: rnd(0.7, 1.6) },
            { x: Math.cos(a) * d, y: Math.sin(a) * d * 0.7, opacity: 0, scale: 0, duration: rnd(0.6, 1.1), ease: "power3.out", immediateRender: false, overwrite: true },
            "pop",
          );
        });
        tl.fromTo(newEl, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2.6)", immediateRender: false }, "pop+=0.04");
        tl.fromTo(
          h1,
          { x: 0, y: 0 },
          {
            x: () => rnd(-14, 14),
            y: () => rnd(-9, 9),
            duration: 0.045,
            repeat: 11,
            yoyo: true,
            ease: "none",
            immediateRender: false,
            onComplete: () => void gsap.set(h1, { x: 0, y: 0 }),
          },
          "pop",
        );

        if (withScout) {
          // 6. The resistance is gone: he stumbles forward into the gap, then catches himself.
          const lungeFrom = { x: 0 };
          tl.to(
            lungeFrom,
            {
              x: 1,
              duration: 0.3,
              ease: "power2.out",
              onStart: () => void (lungeFrom.x = 0),
              onUpdate: () => {
                mixPose(pose, strain(PUSH_S, 1), LUNGE, lungeFrom.x);
                place();
              },
            },
            "pop",
          );
          tl.to(feet, { x: `-=${0.18 * ppu}`, duration: 0.3, ease: "power2.out", onUpdate: place }, "pop");
          poseTo(tl, P({ rootRot: FACE_LEFT }), 0.35, "power2.inOut", "pop+=0.32");
        }

        // 7. The word closes up around "98" and gives one proud pop.
        tl.to(slot, { width: wNew, duration: 0.75, ease: "back.out(1.7)" }, "pop+=0.2");
        tl.to(h1, { scale: 1.045, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 1 }, "pop+=0.55");

        if (withScout) {
          // 8. He walks round to the right of the new word, turns to the audience and flexes,
          //    then settles with his hands on his hips.
          tl.add("settle", "pop+=0.95");
          const go = { d: 0 };
          let from = 0;
          let to = 0;
          tl.to(
            go,
            {
              d: 1,
              duration: 0.75,
              ease: "power1.inOut",
              onStart: () => {
                from = feet.x;
                to = finalSpot().x;
              },
              onUpdate: () => {
                const dir = to >= from ? 1 : -1;
                feet.x = from + (to - from) * go.d;
                copyPose(pose, walk(Math.abs(to - from) * go.d / (0.38 * ppu), dir > 0 ? 1.2 : FACE_LEFT));
                place();
              },
            },
            "settle",
          );
          poseTo(tl, FLEX, 0.45, "back.out(1.6)");
          tl.to({}, { duration: 0.75 });
          poseTo(tl, PROUD, 0.5, "power2.inOut");
          tl.call(() => startLife(PROUD));
        }
      };

      // ── Shared effects ──────────────────────────────────────────────────────────────
      // A ring of sparks, or a fan of them toward `dir` (radians, 0 = right, -π/2 = up).
      const burst = (tl: gsap.core.Timeline, at: number, x: number, y: number, count: number, dist: [number, number], dir?: number, spread = Math.PI) => {
        for (let i = 0; i < count; i++) {
          const s = sparks[sparkIndex++ % sparks.length];
          const a = dir === undefined ? (i / count) * Math.PI * 2 + rnd(-0.2, 0.2) : dir + rnd(-spread / 2, spread / 2);
          const d = rnd(dist[0], dist[1]);
          tl.fromTo(
            s,
            { left: x, top: y, x: 0, y: 0, opacity: 1, scale: rnd(0.7, 1.5) },
            { x: Math.cos(a) * d, y: Math.sin(a) * d * 0.7, opacity: 0, scale: 0, duration: rnd(0.5, 1), ease: "power3.out", immediateRender: false, overwrite: true },
            at,
          );
        }
      };

      const shake = (tl: gsap.core.Timeline, at: number, strength: number) => {
        tl.fromTo(
          h1,
          { x: 0, y: 0 },
          {
            x: () => rnd(-1, 1) * strength,
            y: () => rnd(-1, 1) * strength * 0.8,
            duration: 0.045,
            repeat: 9,
            yoyo: true,
            ease: "none",
            immediateRender: false,
            onComplete: () => void gsap.set(h1, { x: 0, y: 0 }),
          },
          at,
        );
      };

      const flashAt = (tl: gsap.core.Timeline, at: number, x: number, y: number, size: number) => {
        tl.set(flash, { left: x, top: y }, at);
        tl.fromTo(flash, { scale: 0.15, opacity: 0.95 }, { scale: size, opacity: 0, duration: 0.8, ease: "power2.out", immediateRender: false }, at);
      };

      // He turns to the audience, flexes, then settles with his hands on his hips.
      const finish = (tl: gsap.core.Timeline, at: number) => {
        poseTo(tl, FLEX, 0.45, "back.out(1.6)", at);
        tl.to({}, { duration: 0.75 });
        poseTo(tl, PROUD, 0.5, "power2.inOut");
        tl.call(() => startLife(PROUD));
      };

      // ── Stomp ───────────────────────────────────────────────────────────────────────
      const stomp = (tl: gsap.core.Timeline, withScout: boolean) => {
        const m = measure();
        const rr = el.getBoundingClientRect();
        const xh = xHeight();
        const FLAT = 0.18;
        const top = m.ground - xh;
        const flatTop = m.ground - xh * FLAT;
        const landX = m.left + wOld * 0.5;
        const endX = finalX(m);

        gsap.set(newEl, { scale: 1 });
        originAtBaseline([...oldChars, newEl]);
        gsap.set(newEl, { scale: 0.3 });

        // 1. He drops out of the sky onto the middle of "ionate"; his shadow grows on the letters.
        if (withScout) {
          feet.x = landX;
          feet.y = -rr.top - 0.3 * H;
          surf.y = top;
          place();
          copyPose(pose, FALL);
          tl.set([actor, shadow], { opacity: 1 });
          tl.to(feet, { y: top, duration: 0.6, ease: "power2.in", onUpdate: place });
          poseTo(tl, DROP, 0.22, "power1.in", "-=0.22");
        } else {
          tl.to({}, { duration: 0.25 });
        }
        tl.add("impact");
        const T = tl.labels.impact;

        // 2. Impact: the letters squash flat under him, with a shockwave along the line.
        tl.to(oldChars, { scaleY: FLAT, scaleX: 1.14, duration: 0.11, ease: "power4.out" }, T);
        tl.fromTo(oldEl, { filter: "brightness(1)" }, { filter: "brightness(1.45)", duration: 0.11, immediateRender: false }, T);
        if (withScout) {
          tl.to(feet, { y: flatTop, duration: 0.11, ease: "power4.out", onUpdate: place }, T);
          tl.set(surf, { y: flatTop }, T);
          poseTo(tl, LAND, 0.13, "power3.out", T);
        }
        flashAt(tl, T, landX, m.ground - xh * 0.1, 2.4);
        shake(tl, T, 16);
        burst(tl, T, landX, m.ground - 4, 18, [120, 480], Math.PI, 0.5);
        burst(tl, T, landX, m.ground - 4, 18, [120, 480], 0, 0.5);
        tl.to(passChars, { y: -0.2 * fs, duration: 0.14, ease: "power2.out", yoyo: true, repeat: 1, stagger: { each: 0.05, from: "end" } }, T + 0.05);

        // 3. He rises a little, standing on the flattened word.
        if (withScout) poseTo(tl, P(squat(0.35), { rootRot: -0.3, aLz: 0.5, aRz: -0.5, eLx: -0.7, eRx: -0.7 }), 0.35, "power2.out", T + 0.3);

        // 4. He hops off to the right, and the flattened letters spring back up as "98".
        const S = T + 0.85;
        if (withScout) {
          poseTo(tl, P(squat(0.9), { aLx: 0.6, aRx: 0.6, aLz: 0.2, aRz: -0.2 }), 0.14, "power2.in", S - 0.14);
          const j = { t: 0 };
          let fx = 0;
          let fy = 0;
          tl.to(
            j,
            {
              t: 1,
              duration: 0.62,
              ease: "none",
              onStart: () => {
                fx = feet.x;
                fy = feet.y;
                surf.y = m.ground;
              },
              onUpdate: () => {
                const e = j.t * j.t * (3 - 2 * j.t);
                feet.x = fx + (endX - fx) * e;
                feet.y = fy + (m.ground - fy) * j.t - Math.sin(Math.PI * j.t) * 1.15 * ppu;
                place();
              },
            },
            S,
          );
          poseTo(tl, TUCK, 0.26, "power2.out", S);
          poseTo(tl, P({ aLz: 1.3, aRz: -1.3, ftLx: 0.2, ftRx: 0.2 }), 0.3, "power1.in", S + 0.32);
          // Landing.
          poseTo(tl, P(squat(0.7), { aLz: 0.9, aRz: -0.9 }), 0.1, "power3.out", S + 0.62);
          burst(tl, S + 0.62, endX, m.ground - 4, 8, [30, 110], -Math.PI / 2, 2.4);
          poseTo(tl, P(), 0.3, "power2.out", S + 0.72);
        }
        tl.to(oldChars, { x: (i: number) => (m.letterCenters[i] - m.left) * (ratio - 1), scaleX: 0.55, duration: 0.16, ease: "power2.in" }, S);
        tl.to(oldChars, { opacity: 0, duration: 0.1 }, S + 0.12);
        tl.to(oldEl, { filter: "brightness(1)", duration: 0.2 }, S);
        tl.fromTo(newEl, { opacity: 1, scaleY: FLAT, scaleX: 1.3 }, { scaleY: 1, scaleX: 1, duration: 1, ease: "elastic.out(1.1,0.32)", immediateRender: false }, S + 0.12);
        burst(tl, S + 0.12, m.left + wNew / 2, m.ground - 0.3 * fs, 22, [90, 300], -Math.PI / 2, 2.2);
        tl.to(slot, { width: wNew, duration: 0.6, ease: "back.out(1.5)" }, S + 0.15);
        tl.to(h1, { scale: 1.045, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 1 }, S + 0.65);

        // 5. Flex, then hands on hips.
        if (withScout) finish(tl, S + 1.05);
      };

      // ── Flying kick ─────────────────────────────────────────────────────────────────
      const kick = (tl: gsap.core.Timeline, withScout: boolean) => {
        const m = measure();
        const rr = el.getBoundingClientRect();
        const xh = xHeight();
        const s = scoutRef.current;
        const n = oldChars.length;
        const right = oldChars[n - 1].getBoundingClientRect().right - rr.left - 0.06 * fs; // the "e"
        const hitY = m.ground - xh * 0.6;
        const foot = s ? s.measureFoot(KICK_FLY) : { x: -0.9 * ppu, y: -0.8 * ppu };
        const hit = { x: right - foot.x, y: hitY - foot.y };
        const takeX = hit.x + 1.35 * ppu;
        const landX = hit.x - 0.15 * ppu;
        const endX = finalX(m);

        // 1. He sprints in from the right, crouches and leaps, kicking knee up.
        if (withScout) {
          feet.x = m.viewRight + W * 0.6;
          feet.y = m.ground;
          surf.y = m.ground;
          place();
          tl.set([actor, shadow], { opacity: 1 });
          const dist = feet.x - takeX;
          const dur = Math.max(0.65, dist / (3.4 * ppu));
          const r = { d: 0 };
          const startX = feet.x;
          tl.to(r, {
            d: 1,
            duration: dur,
            ease: "none",
            onUpdate: () => {
              feet.x = startX - r.d * dist;
              copyPose(pose, P(LOOPS.run(r.d * dur * 1.25), { rootRot: KICK_FACE }));
              place();
            },
          });
          poseTo(tl, CROUCH, 0.12, "power2.in");
          tl.add("leap");
          const j = { t: 0 };
          tl.to(
            j,
            {
              t: 1,
              duration: 0.42,
              ease: "none",
              onUpdate: () => {
                feet.x = takeX + (hit.x - takeX) * j.t;
                feet.y = m.ground + (hit.y - m.ground) * j.t - Math.sin(Math.PI * j.t) * 0.6 * ppu;
                place();
              },
            },
            "leap",
          );
          poseTo(tl, CHAMBER, 0.22, "power2.out", "leap");
          poseTo(tl, KICK_FLY, 0.12, "power3.out", "leap+=0.30");
        } else {
          tl.to({}, { duration: 0.25 });
        }
        tl.add("hit");
        const T = tl.labels.hit;

        // 2. Contact: a beat of hit-stop, a flash, and "ionate" is bowled off the screen, "e" first.
        tl.to(oldChars[n - 1], { scaleX: 0.55, duration: 0.05, ease: "power2.out" }, T);
        flashAt(tl, T, right, hitY, 1.8);
        shake(tl, T, 18);
        burst(tl, T, right, hitY, 26, [140, 420], Math.PI, 1.6);
        oldChars.forEach((c, i) => {
          const at = T + 0.07 + (n - 1 - i) * 0.035;
          const dur = rnd(0.85, 1.15);
          tl.to(c, { x: -(m.letterCenters[i] + rnd(250, 600)), rotation: rnd(-760, -260), scaleX: 1, duration: dur, ease: "power1.out" }, at);
          tl.to(c, { y: -rnd(90, 280), duration: 0.32, ease: "power2.out" }, at);
          tl.to(c, { y: rnd(350, 650), duration: dur - 0.32, ease: "power2.in" }, at + 0.32);
          tl.to(c, { opacity: 0, duration: 0.3 }, at + dur - 0.3);
        });

        // 3. He holds the kick for a beat, drops back to the ground and lands in a crouch.
        if (withScout) {
          tl.to(feet, { x: landX, y: m.ground, duration: 0.34, ease: "power2.in", onUpdate: place }, T + 0.07);
          poseTo(tl, P({ rootRot: KICK_FACE, aLz: 1, aRz: -1, thLx: -0.4, knLx: 0.8, thRx: -0.2, knRx: 0.4 }), 0.22, "power2.out", T + 0.07);
          poseTo(tl, P(squat(0.8), { rootRot: KICK_FACE, aLz: 0.8, aRz: -0.8 }), 0.1, "power3.out", T + 0.41);
          burst(tl, T + 0.41, landX, m.ground - 4, 8, [30, 110], -Math.PI / 2, 2.4);
          poseTo(tl, P({ rootRot: FACE_LEFT }), 0.3, "power2.out", T + 0.55);
        }

        // 4. The empty space closes up, and he walks over to where "98" will land.
        const C = T + 0.8;
        tl.set(newEl, { opacity: 1, scale: 1, transformOrigin: "50% 50%" }, C);
        tl.set(digits, { y: -(rr.top + m.ground) - 0.2 * fs }, C);
        tl.call(() => originAtBaseline(digits), [], C + 0.01);
        tl.to(slot, { width: wNew, duration: 0.55, ease: "power2.inOut" }, C);
        if (withScout) {
          const go = { d: 0 };
          let from = 0;
          tl.to(
            go,
            {
              d: 1,
              duration: 0.6,
              ease: "power1.inOut",
              onStart: () => void (from = feet.x),
              onUpdate: () => {
                feet.x = from + (endX - from) * go.d;
                copyPose(pose, walk((Math.abs(endX - from) * go.d) / (0.38 * ppu), endX < from ? FACE_LEFT : 1.2));
                place();
              },
            },
            C + 0.05,
          );
          poseTo(tl, LOOK_UP, 0.35, "power2.out", C + 0.68);
        }

        // 5. "9", then "8", fall from the sky and slam into place; he flinches at each landing.
        const drops: [HTMLElement, number][] = [
          [digits[0], C + 0.95],
          [digits[1], C + 1.55],
        ];
        drops.forEach(([d, at], k) => {
          const land = at + 0.42;
          tl.to(d, { y: 0, duration: 0.42, ease: "power3.in" }, at);
          tl.to(d, { scaleY: 0.68, scaleX: 1.22, duration: 0.06, ease: "power2.out" }, land);
          tl.to(d, { scaleY: 1, scaleX: 1, duration: 0.6, ease: "elastic.out(1,0.4)" }, land + 0.06);
          tl.call(
            () => {
              const r = d.getBoundingClientRect();
              const x = r.left - rr.left + r.width / 2;
              const dust = gsap.timeline();
              burst(dust, 0, x, m.ground - 4, 10 + k * 8, [60, 220 + k * 120], Math.PI, 0.6);
              burst(dust, 0, x, m.ground - 4, 10 + k * 8, [60, 220 + k * 120], 0, 0.6);
            },
            [],
            land,
          );
          shake(tl, land, 10 + k * 8);
          if (withScout) {
            tl.to(feet, { y: m.ground - (0.12 + k * 0.1) * ppu, duration: 0.12, ease: "power2.out", yoyo: true, repeat: 1, onUpdate: place }, land + 0.02);
          }
        });
        tl.to(h1, { scale: 1.045, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 1 }, C + 2.05);

        // 6. Flex, then hands on hips.
        if (withScout) finish(tl, C + 2.3);
      };

      const reset = () => {
        if (phase === "idle") return;
        timeline?.kill();
        timeline = null;
        gsap.killTweensOf([h1, ...oldChars, ...passChars, ...digits, ...sparks, flash, newEl, slot, oldEl, actor, shadow, feet, surf]);
        showRest();
        phase = "idle";
      };

      api.current = {
        play,
        reset,
        scoutReady: () => {
          if (phase === "waiting") run();
          else if (phase === "done" && stepRef.current >= 1) showFinal();
        },
      };

      // ── First paint ─────────────────────────────────────────────────────────────────
      gsap.set(pass, { opacity: 1 });
      if (startAtEnd) {
        showFinal();
      } else {
        showRest();
        gsap.set([...passChars, ...oldChars], { opacity: 0, yPercent: 90 });
        gsap.to([...passChars, ...oldChars], { opacity: 1, yPercent: 0, duration: 0.9, stagger: 0.07, delay: 0.5, ease: "expo.out" });
      }

      return () => {
        api.current = null;
        timeline?.kill();
        life?.();
      };
    },
    { scope: stage },
  );

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

      <div ref={stage} className="relative flex w-full justify-center">
        <div
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
              <span data-old className="inline-block justify-self-start text-transparent opacity-0" style={{ gridArea: "1 / 1" }}>
                {OLD_NAME}
              </span>
              <span data-new className="inline-block justify-self-start pr-[0.09em] opacity-0" style={{ gridArea: "1 / 1" }}>
                {/* Each digit can fall on its own; the gradient runs across both. */}
                {NEW_NAME.split("").map((d, i) => (
                  <span
                    key={i}
                    data-digit
                    className="text-gradient inline-block"
                    style={{ backgroundSize: "200% 100%", backgroundPosition: i === 0 ? "0% 0" : "100% 0" }}
                  >
                    {d}
                  </span>
                ))}
              </span>
            </span>
            {/* Zero-size marker whose top edge is the text baseline: his feet stand on it. */}
            <span data-baseline aria-hidden className="inline-block size-0 align-baseline" />
          </h1>
        </div>

        <div
          data-flash
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 size-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
          style={{ background: "radial-gradient(circle, rgba(255,190,120,0.95), rgba(254,102,0,0.35) 38%, transparent 68%)" }}
        />
        {Array.from({ length: SPARKS }, (_, i) => (
          <span
            key={i}
            data-spark
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-soft opacity-0 shadow-[0_0_14px_#fe6600]"
          />
        ))}

        {/* The Orange Scout and his contact shadow. */}
        <div
          data-shadow
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-10 h-3 rounded-full opacity-0"
          style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.65), transparent 70%)" }}
        />
        <div data-actor aria-hidden className="pointer-events-none absolute left-0 top-0 z-20 opacity-0">
          {box && <ScoutStage pose={pose} width={box.w} height={box.h} onReady={onReady} onFail={onFail} />}
        </div>
      </div>

      <p data-in data-delay="1.1" className="lede mx-auto mt-8 max-w-[34ch] text-center text-[clamp(1.1rem,2vw,1.7rem)] text-ink/85">
        Practice with AI. Get your score. Get hired.
      </p>

      <div data-in data-delay="1.3" className="mt-9 flex flex-wrap items-center justify-center gap-2.5">
        <Chip tone="brand">{TOTAL_FEATURES} features</Chip>
        <Chip>3 personas</Chip>
        <Chip>Web · iOS · Android</Chip>
      </div>

      <p data-in="fade" data-delay="1.8" className="mono mt-12 flex animate-pulse-soft items-center gap-2.5 text-xs tracking-[0.3em] text-faint">
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
