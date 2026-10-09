# Pass98 product deck

A 21-slide presentation built as a Next.js app. It opens in any browser, works on a projector or a
phone, and every number on it comes from the audit in [`../FEATURE-CATALOG.md`](../FEATURE-CATALOG.md).

## Run it

```bash
cd Pass98-Showcase/ppt
npm install
npm run dev        # http://localhost:3000
```

For presenting, a production build is smoother:

```bash
npm run build && npm run start
```

Press **F** for fullscreen. The URL tracks the slide (`#7`), so you can link straight to one.

## Controls

| Key | Does |
|---|---|
| `→` `↓` `Space` `Enter` | Next build, or next slide |
| `←` `↑` `Backspace` | Previous |
| `Home` / `End` | First / last slide |
| `O` | Overview grid of every slide |
| `N` | Speaker notes for the current slide |
| `F` | Fullscreen |
| `?` | Keyboard help |
| Swipe left / right | Touch screens |
| Click the mascot | Makes him spin |

Some slides have **builds**: pressing next first reveals the next step on the same slide (the voice
pipeline, the five pre-call steps, the focus plan, the better English answer, the architecture
layers). Small dots at the bottom right show the build progress.

## The slides

| # | Slide | Idea |
|---|---|---|
| 1 | Pass98 | Cover: rests on "Passionate"; on click "ionate" fights, then "98" smashes in and it becomes Pass98 (1 build) |
| 2 | The problem | The old way is struck out, the new way lights up |
| 3 | Four personas | One login, four workspaces |
| 4 | Product map | 14 domains, 153 features |
| 5 | Meet Anna | The live voice interview and its pipeline (4 builds) |
| 6 | Before the call | Role, questions, devices, network, launch (4 builds) |
| 7 | The report | Readiness gauge, skill bars, focus plan (1 build) |
| 8 | Leo, the mentor | A scripted, streaming chat |
| 9 | Resume suite | Six templates dealt out as a fan |
| 10 | Career tools | Versions of an outreach message |
| 11 | Coding missions | Constellation map, streak, 11 badges |
| 12 | Practice English | Grade board, fix, better answer (1 build) |
| 13 | Plans | Metered limits as animated meters |
| 14 | Referral loop | Give 7 days, get 7 days |
| 15 | For colleges | Roster to reports, plus the enterprise tiers |
| 16 | Operate and support | Admin console, impersonation, Help Center |
| 17 | Architecture | Four layers (2 builds) |
| 18 | Engineering choices | Four decisions with a number each |
| 19 | By the numbers | Eight counted figures |
| 20 | Roadmap | Six queued items |
| 21 | Level up | Close |

Numbers on slides 7 (the report), 8 (the chat) and 10 (the draft) are **samples**, and the slides
say so where it matters. The plan limits on slide 13 are the launch defaults from the seed file;
the live values are edited in the admin console.

## What it is built with

| Library | Used for |
|---|---|
| **Next.js 16** (App Router, Turbopack) and **React 19** | The app |
| **GSAP 3.15** with **SplitText**, **CustomEase** and `@gsap/react` | Heading reveals, staggered entrances, gauges, meters, fans, loops, embers |
| **Framer Motion 12** | Slide transitions, builds, the overview, the mascot's entrance |
| **react-three-fiber**, **drei** and **three.js** | The particle field, the wireframe core, and the 3D mascot |
| **Tailwind CSS 4** | Styling, with the product's own colour tokens |
| **lucide-react** | Icons |
| Space Grotesk and Geist Mono (Fontsource) | Type, self-hosted |

## The look

It borrows the product's dark theme: a near-black warm surface, the orange primary (`#FE6600`) and
deep orange (`#FB4D02`), Space Grotesk headings, glass cards and soft glows. One idea per slide,
and animation is there to explain something (a pipeline lighting up, a loop closing), not to fill
space.

- **Backdrop:** a drifting particle field behind every slide, with the camera easing to a new
  position as you move. A wireframe **core** appears on just two slides (personas and numbers).
- **Mascot:** the same 3D character as the product dashboard, loaded from the product's own
  `model.glb` (1.5 MB) and studio lighting. He spins once when he arrives, breathes, hops when
  cheering, tilts his head when thinking, glances toward the pointer, and spins when clicked. He
  appears on the pre-call steps, the architecture, the roadmap and the close (the cover is left to the name animation).
- **Accessibility:** with *reduce motion* set, entrance animations are skipped, counters jump to
  their value and the mascot is hidden. Phones get a single-column layout and swipe navigation.

## Editing the deck

Everything lives in a few places:

| To change | Edit |
|---|---|
| Order, titles, speaker notes, which slides get the core or the mascot | `components/slides/index.ts` |
| A slide's content or animation | `components/slides/S##….tsx` |
| The numbers and domains | `lib/data.ts` |
| Colours and shared styles | `app/globals.css` |
| Entrance choreography for headings and `data-in` elements | `components/ui/SlideFrame.tsx` |
| The mascot's behaviour | `components/deck/MascotLayer.tsx` |
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
   seconds, glowing hotter, throwing off sparks.
2. "98" charges in from the right.
3. Impact: the letters of "ionate" are blown apart, the heading shakes, a flash and a burst of sparks
   fly, and "Pass" and "98" close up into the final word, **Pass98**.

Going forward and then back lands on the finished word; stepping back from it resets to
"Passionate" so it can be replayed. With *reduce motion* set, the cover simply shows Pass98. To
change the words, edit `OLD_NAME`, `NEW_NAME` and `FIGHT_SECONDS` at the top of
`components/slides/S01Cover.tsx`.

## Notes

- `public/model.glb` and `public/studio-lighting.hdr` are copies from the frontend repo. If the
  mascot is updated there, copy the new file over.
- The product logo SVG in the frontend repo points at a missing PNG, so the deck uses
  `pass98-logo.png`.
- The deck loads no external network resources at runtime.
