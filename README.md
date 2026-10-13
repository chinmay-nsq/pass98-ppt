# Pass98 product deck

A 16-slide presentation built as a Next.js app. It opens in any browser, works on a projector or a
phone, and every number on it comes from the audit in [`../FEATURE-CATALOG.md`](../FEATURE-CATALOG.md).

## Run it

```bash
cd Pass98-Showcase/ppt
npm install
npm run dev        # http://localhost:3000
```

For presenting, a production build is smoother. The deck is a static export, so `npm run build` writes
plain files to `out/`; serve that folder with any static server (it is what GitHub Pages hosts):

```bash
npm run build
npx serve out        # or: python -m http.server --directory out
```

Press **F** for fullscreen. The URL tracks the slide (`#7`), so you can link straight to one.

## Controls

| Key | Does |
|---|---|
| `â†’` `â†“` `Space` `Enter` | Next build, or next slide |
| `â†` `â†‘` `Backspace` | Previous |
| `Home` / `End` | First / last slide |
| `O` | Overview grid of every slide |
| `N` | Speaker notes for the current slide |
| `F` | Fullscreen |
| `?` | Keyboard help |
| Swipe left / right | Touch screens |
| Click the cover word | Starts the name animation |

Some slides have **builds**: pressing next first reveals the next step on the same slide (the four
getting-started steps, the focus plan, the better English answer). Small dots at the bottom right
show the build progress.

## The slides

| # | Slide | Idea |
|---|---|---|
| 1 | Pass98 | "Passionate" turns into Pass98 on click (Push by default; 1 build) |
| 2 | The problem | What students face today is struck out, Pass98's answer lights up, and who uses it |
| 3 | Getting started | Job role, your CV, questions from both, pick a time and start (3 builds) |
| 4 | Meet Anna and Leo | The live voice interview; the pipeline lights up on its own |
| 5 | The report | Readiness gauge, skill bars, focus plan (1 build) |
| 6 | Resume suite | Six templates dealt out as a fan |
| 7 | Practice English | Grade board, fix, better answer (1 build) |
| 8 | How colleges use Pass98 | Five simple steps, from uploading students to seeing who is ready |
| 9 | Everything else | Leo, ATS score, job match, cover letters, coding, dashboard |
| 10 | Tech stack and architecture | Six groups of tools, and a four-step strip of how an answer flows |
| 11 | Level up | Close |

Numbers on the report slide are **samples**, and the slide says so.

## What it is built with

| Library | Used for |
|---|---|
| **Next.js 16** (App Router, Turbopack) and **React 19** | The app |
| **GSAP 3.15** with **SplitText**, **CustomEase** and `@gsap/react` | Heading reveals, staggered entrances, gauges, meters, fans, loops, embers |
| **Framer Motion 12** | Slide transitions, builds, the overview |
| **react-three-fiber** and **three.js** | The particle field and the wireframe core behind the slides |
| **Tailwind CSS 4** | Styling, with the product's own colour tokens |
| **lucide-react** | Icons |
| Space Grotesk and Geist Mono (Fontsource) | Type, self-hosted |

## The look

It borrows the product's dark theme: a near-black warm surface, the orange primary (`#FE6600`) and
deep orange (`#FB4D02`), Space Grotesk headings, glass cards and soft glows. One idea per slide,
and animation is there to explain something (a pipeline lighting up, a loop closing), not to fill
space.

- **Backdrop:** a drifting particle field behind every slide, with the camera easing to a new
  position as you move. A wireframe **core** appears on one slide (personas).
- **Accessibility:** with *reduce motion* set, entrance animations are skipped, counters jump to
  their value. Phones get a single-column layout and swipe navigation.

## Editing the deck

Everything lives in a few places:

| To change | Edit |
|---|---|
| Order, titles, speaker notes, which slide gets the core | `components/slides/index.ts` |
| A slide's content or animation | `components/slides/S##â€¦.tsx` |
| The numbers and domains | `lib/data.ts` |
| Colours and shared styles | `app/globals.css` |
| Entrance choreography for headings and `data-in` elements | `components/ui/SlideFrame.tsx` |
| The 3D backdrop | `components/deck/Backdrop.tsx` |

Mark any element with `data-in` (optionally `="left" | "right" | "zoom" | "fade"`, and
`data-delay="0.3"`) and `SlideFrame` animates it in. Give a slide a `steps` count in the registry
and read the `step` prop to build progressively.

Two things learned while building, in case you extend it:
- Do not put a Tailwind `transition` class on an element GSAP animates; the two fight on every
  frame and the tween never visibly finishes. Put the hover transition on an inner element.
- Gradient text (`background-clip: text`) disappears when SplitText wraps its words in transformed
  boxes, so `SlideFrame` re-applies the gradient to each split word.

## The cover animation

The cover rests on the original word, **Passionate** (Pass + ionate), and does nothing until you ask it
to. Click the word, or press the next key (it is the cover's one build step):

1. "ionate" starts to fight itself: the letters vibrate harder and harder for about three and a half
   seconds, glowing hotter and throwing off sparks.
2. "98" charges in from the right.
3. Impact: the letters of "ionate" are blown apart, the heading shakes, a flash and a burst of sparks
   fly, and "Pass" and "98" close up into the final word, **Pass98**.

Going forward and then back lands on the finished word; stepping
back from it resets to "Passionate" so it can be replayed. With *reduce motion* set, the cover simply
shows Pass98. To change the words or timing, edit `OLD_NAME`, `NEW_NAME` and `FIGHT_SECONDS` at the
top of `components/slides/S01Cover.tsx`.

## Notes

- The product logo SVG in the frontend repo points at a missing PNG, so the deck uses
  `pass98-logo.png`.
- The deck loads no external network resources at runtime.

## Presenter script

A word-for-word script with click cues and a time budget for each slide (about 12 minutes) is published
as a private Claude artifact: https://claude.ai/artifact/MmZm9fg7pcAurSP7JnRimd. The short notes
behind the **N** key in the deck follow the same lines.

## Cover versions

The cover opens with **Push** by default. There is no on-screen switch; press **C** on the cover to
cycle through Classic, Push, Stomp and Kick (the choice is remembered on this device).

- **Classic:** "ionate" shakes, then "98" smashes in from the right. No character.
- The other three star the Orange Scout (the rigged model from `../orange-scout`, copied to
  `public/scout.glb`). Each ends with him flexing and settling beside "98", hands on hips.
  - **Push (default):** he walks in from the right and pushes "ionate" to the left until it pops into
    "98", then stands beside it, relaxed.
  - **Stomp:** he drops from the top of the screen onto "ionate" and squashes it flat with a
    shockwave ("Pass" hops). He hops off and the flattened letters spring back up as "98".
  - **Kick:** he sprints in from the right and flying-kicks the "e". The letters are bowled off the
    screen, then "9" and "8" fall from the sky and slam into place.

With any Scout version on, he also makes cameos on two later slides (hidden in Classic):

| Slide | What he does |
| --- | --- |
| 5, The report | Runs onto the skill bars, turns to the audience and front-flips onto the score, stomps it three times (64 → 70 → 76 → 82, each with a shockwave; sparks on the last), then front-flips off to a superhero landing at the bottom-left of the score card |
| 11, Closing | Runs in, bows to the audience with a hand on his chest (thank you), then gives them a high-five |

A cameo stands on cards marked `data-cameo="<name>"` (a `Spot` with `anchor`), hops between them, and can signal the slide (`emit`), so he lands
on it at any screen size.

The routines are set per slide in `components/slides/index.ts` (`stage.scout`) and played by
`components/deck/ScoutCameo.tsx`, which uses the model's own moves (wave, jump, kick, punch, flex, spin,
dance, run) from `lib/scoutPose.ts`.

The Scout versions use three.js directly (`components/deck/ScoutStage.tsx`) and the poses in
`lib/scoutPose.ts`, ported from the model's own `orange-scout/web/index.html`. The model is 1.6 MB (meshopt-compressed from 7.9 MB),
so it only loads when the Scout version is on screen. It needs a GPU: on machines without one the
browser draws it slowly, so test the laptop you will present from.
