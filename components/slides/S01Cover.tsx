"use client";

import { useEffect, useRef } from "react";
import { MousePointerClick } from "lucide-react";
import { SlideFrame } from "@/components/ui/SlideFrame";
import { Chip } from "@/components/ui/Glass";
import { cn } from "@/lib/cn";
import { TOTAL_FEATURES } from "@/lib/data";
import { gsap, SplitText, useGSAP, reducedMotion } from "@/lib/gsap";
import type { SlideProps } from "./types";

/**
 * The cover tells the name's story. It rests on the original word, "Passionate" (Pass + ionate).
 * Nothing happens until the presenter clicks the word (or presses the next key): then "ionate"
 * fights with itself, vibrating harder and harder for a few seconds, until "98" charges in,
 * smashes it apart, and the word closes up into the final name: Pass98.
 *
 * The reveal is the cover's one build step, so the deck's own navigation drives it too: going
 * back from the next slide lands on the finished word, and stepping back replays from the start.
 */
const OLD_NAME = "ionate";
const NEW_NAME = "98";
const SPARKS = 50;
const FIGHT_SECONDS = 3.4;

type Phase = "idle" | "playing" | "done";

export default function Cover({ step, next }: SlideProps) {
  const root = useRef<HTMLDivElement>(null);
  const api = useRef<{ play: () => void; reset: () => void } | null>(null);
  const stepRef = useRef(step);
  stepRef.current = step;

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = <T extends HTMLElement>(sel: string) => el.querySelector<T>(sel)!;
      const h1 = q("[data-title]");
      const pass = q("[data-pass]");
      const slot = q("[data-slot]");
      const oldEl = q("[data-old]");
      const newEl = q("[data-new]");
      const flash = q("[data-flash]");
      const sparks = gsap.utils.toArray<HTMLElement>("[data-spark]", el);

      const wOld = oldEl.offsetWidth;
      const wNew = newEl.offsetWidth;
      const startAtEnd = stepRef.current >= 1 || reducedMotion();
      const rnd = gsap.utils.random;

      // Where the fight happens, relative to the heading: the middle of "ionate".
      const hitX = slot.offsetLeft + wOld / 2;
      const hitY = slot.offsetTop + slot.offsetHeight / 2;
      gsap.set([flash, ...sparks], { left: hitX, top: hitY });

      const passChars = SplitText.create(pass, { type: "chars" }).chars;
      const oldChars = SplitText.create(oldEl, { type: "chars" }).chars;
      // background-clip text is lost on transformed children, so each letter carries the gradient.
      oldChars.forEach((c) => c.classList.add("tg-word"));

      const OFFSCREEN = { x: window.innerWidth * 0.75, scale: 1.6, filter: "blur(16px)", skewX: -18 };
      const ARRIVED = { x: 0, scale: 1, filter: "blur(0px)", skewX: 0 };

      let phase: Phase = startAtEnd ? "done" : "idle";
      let timeline: gsap.core.Timeline | null = null;
      let sparkIndex = 0;

      // A single spark flies off from a random spot on the word while it fights.
      const emitSpark = () => {
        const s = sparks[sparkIndex++ % sparks.length];
        gsap.fromTo(
          s,
          { x: rnd(-wOld / 2, wOld / 2), y: rnd(-60, 60), opacity: 1, scale: rnd(0.5, 1.2) },
          { x: `+=${rnd(-70, 70)}`, y: `-=${rnd(40, 130)}`, opacity: 0, scale: 0, duration: rnd(0.35, 0.7), ease: "power2.out", overwrite: true },
        );
      };

      // The finished word, with no animation. Used when the slide opens already revealed.
      const showFinal = () => {
        slot.style.width = `${wNew}px`;
        gsap.set([pass, ...passChars], { opacity: 1, yPercent: 0 });
        gsap.set(oldEl, { display: "none" });
        gsap.set(newEl, { opacity: 1, ...ARRIVED });
        gsap.set([flash, ...sparks], { opacity: 0 });
      };

      // The resting word: "Passionate".
      const showRest = () => {
        slot.style.width = `${wOld}px`;
        gsap.set(oldEl, { clearProps: "display,filter", opacity: 1 });
        // Reset only what the animation touches. Clearing everything would also strip the
        // inline-block display SplitText gives each letter, and the word would stack vertically.
        gsap.set(oldChars, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, yPercent: 0 });
        gsap.set(h1, { x: 0, y: 0, scale: 1 });
        gsap.set(newEl, { opacity: 1, ...OFFSCREEN });
        gsap.set([flash, ...sparks], { opacity: 0 });
      };

      const play = () => {
        if (phase !== "idle") return;
        phase = "playing";
        const amp = { v: 0.1 };

        const tl = gsap.timeline({ onComplete: () => void (phase = "done") });
        timeline = tl;

        // 1. The fight: "ionate" vibrates harder and harder and runs hot.
        tl.to(amp, {
          v: 1,
          duration: FIGHT_SECONDS,
          ease: "power2.in",
          onUpdate: () => {
            const a = amp.v;
            oldChars.forEach((c) =>
              gsap.set(c, {
                x: rnd(-1, 1) * a * 16,
                y: rnd(-1, 1) * a * 13,
                rotation: rnd(-1, 1) * a * 16,
                scale: 1 + rnd(0, 1) * a * 0.14,
              }),
            );
            gsap.set(oldEl, { filter: `brightness(${1 + a * 0.6})` });
            if (Math.random() < a * 0.45) emitSpark();
          },
        });

        // 2. "98" charges in from the right, arriving just as the fight peaks.
        tl.to(newEl, { ...ARRIVED, duration: 0.5, ease: "power4.in" }, ">-0.25");
        tl.add("hit");

        // 3. Impact: every letter of "ionate" is blown apart, the word shakes, flash and sparks.
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
        tl.fromTo(flash, { scale: 0.15, opacity: 0.95 }, { scale: 3, opacity: 0, duration: 1, ease: "power2.out", immediateRender: false }, "hit");
        sparks.forEach((s, i) => {
          const a = (i / SPARKS) * Math.PI * 2 + rnd(-0.2, 0.2);
          const d = rnd(130, 420);
          tl.fromTo(
            s,
            { x: 0, y: 0, opacity: 1, scale: rnd(0.7, 1.7) },
            { x: Math.cos(a) * d, y: Math.sin(a) * d * 0.7, opacity: 0, scale: 0, duration: rnd(0.6, 1.2), ease: "power3.out", immediateRender: false },
            "hit",
          );
        });

        // 4. The word closes up around "98" and gives one proud pop.
        tl.to(slot, { width: wNew, duration: 0.75, ease: "back.out(1.7)" }, "hit+=0.2");
        tl.to(h1, { scale: 1.045, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 1 }, "hit+=0.55");
      };

      // Stepping back from the revealed cover replays the story from "Passionate".
      const reset = () => {
        if (phase === "idle") return;
        timeline?.kill();
        timeline = null;
        gsap.killTweensOf([h1, ...oldChars, ...sparks, flash, newEl, slot, oldEl]);
        showRest();
        phase = "idle";
      };

      api.current = { play, reset };

      // First paint.
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
            <span data-old className="inline-block justify-self-start text-transparent opacity-0" style={{ gridArea: "1 / 1" }}>
              {OLD_NAME}
            </span>
            <span data-new className="text-gradient inline-block justify-self-start pr-[0.09em] opacity-0" style={{ gridArea: "1 / 1" }}>
              {NEW_NAME}
            </span>
          </span>
        </h1>

        {/* Effects, positioned in JS over the middle of the word. */}
        <div
          data-flash
          aria-hidden
          className="pointer-events-none absolute size-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
          style={{ background: "radial-gradient(circle, rgba(255,190,120,0.95), rgba(254,102,0,0.35) 38%, transparent 68%)" }}
        />
        {Array.from({ length: SPARKS }, (_, i) => (
          <span
            key={i}
            data-spark
            aria-hidden
            className="pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-soft opacity-0 shadow-[0_0_14px_#fe6600]"
          />
        ))}
      </div>

      <p data-in data-delay="1.1" className="lede mx-auto mt-8 max-w-[34ch] text-center text-[clamp(1.1rem,2vw,1.7rem)] text-ink/85">
        The AI interview gym. Practice live, get scored, level up.
      </p>

      <div data-in data-delay="1.3" className="mt-9 flex flex-wrap items-center justify-center gap-2.5">
        <Chip tone="brand">{TOTAL_FEATURES} features</Chip>
        <Chip>4 personas</Chip>
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
