'use client';

import { useEffect, useId, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { collectParts, renderRig, type RigState } from '@/lib/mascotRig';

/**
 * The Pass98 mascot, drawn as layered SVG so every part of his body can move. It follows the
 * character sheet: a matte orange helmet with the swoosh crest and dark ear pods ringed in glowing
 * orange; a fair face with brown eyes under thick tapered brows and a one-sided smirk; an orange
 * leather bomber with black stripes from collar to cuff, a popped collar, ribbed black hem and
 * cuffs and a silver zip, open over a black tee with a gold "98"; a brown belt with a silver buckle
 * and a hanging chain; slim charcoal trousers; tan-orange lace-up boots; bare hands.
 *
 * Shading is soft and rounded (gradients, rim light, contact shadows) with thin warm outlines, so he
 * reads like the 3D render while every limb stays poseable.
 *
 * The component only draws. It is moved by `state` (see lib/mascotRig.ts): a plain object the host
 * tweens with GSAP; a ticker writes it into the SVG on every frame.
 *
 * Coordinates: viewBox 300 x 600, centred on x = 150, soles on y = 590. Limbs are authored for the
 * screen-left side and mirrored for the right.
 */

const LINE = '#4a1d08';
const W = 1.8; // outline width
const STRIPE = '#1c1a1f';

const Ribs = ({ x, y, w, h, n }: { x: number; y: number; w: number; h: number; n: number }) => (
  <g stroke="#fff" strokeOpacity="0.13" strokeWidth="1">
    {Array.from({ length: n }, (_, i) => {
      const px = x + (w / (n + 1)) * (i + 1);
      return <path key={i} d={`M${px} ${y + 1.5} V${y + h - 1.5}`} />;
    })}
  </g>
);

/** One arm: sleeve with the black stripe, elbow joint, ribbed cuff, a bare fist. */
function Arm({ side, id, copy = '' }: { side: 'L' | 'R'; id: string; copy?: string }) {
  const mirrored = side === 'R';
  return (
    <g transform={mirrored ? 'translate(300 0) scale(-1 1)' : undefined}>
      <g data-part={`arm${side}${copy}`}>
        <path
          d="M104 250 Q86 258 86 296 Q86 326 96 338 Q112 344 119 324 Q126 290 124 264 Q121 249 110 248 Z"
          fill={`url(#${id}-sleeve)`}
          stroke={LINE}
          strokeWidth={W}
          strokeLinejoin="round"
        />
        <path d="M100 254 Q89 270 89 300 Q90 322 96 334" stroke={STRIPE} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M112 256 Q121 266 120 292" stroke="#fff" strokeOpacity="0.22" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        <path d="M95 318 Q106 324 117 318" stroke="#7a3110" strokeOpacity="0.35" strokeWidth="2" fill="none" strokeLinecap="round" />
        <g data-part={`fore${side}${copy}`}>
          <path d="M90 330 Q86 360 92 386 H115 Q120 360 116 330 Z" fill={`url(#${id}-sleeve)`} stroke={LINE} strokeWidth={W} strokeLinejoin="round" />
          <path d="M94 334 Q90 360 95 383" stroke={STRIPE} strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M110 338 Q114 358 111 378" stroke="#fff" strokeOpacity="0.18" strokeWidth="3" fill="none" strokeLinecap="round" />
          <rect x="89" y="381" width="29" height="13" rx="4" fill={`url(#${id}-black)`} stroke={LINE} strokeWidth={W} />
          <Ribs x={89} y={381} w={29} h={13} n={6} />
          {/* fist */}
          <path
            data-part={copy ? undefined : `hand${side}`}
            d="M90 393 Q83 407 89 420 Q97 431 111 427 Q122 421 120 406 L118 393 Z"
            fill={`url(#${id}-skin)`}
            stroke={LINE}
            strokeWidth={W}
            strokeLinejoin="round"
          />
          <path d="M117 400 Q129 403 125 416 Q120 422 114 415 Z" fill={`url(#${id}-skin)`} stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M95 405 V419 M102 406 V422 M109 405 V420" stroke="#c4876a" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M92 401 Q93 410 97 415" stroke="#fff" strokeOpacity="0.45" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
}

function Leg({ side, id }: { side: 'L' | 'R'; id: string }) {
  const mirrored = side === 'R';
  return (
    <g transform={mirrored ? 'translate(300 0) scale(-1 1)' : undefined}>
      <g data-part={`leg${side}`}>
        <g data-part={`pants${side}`}>
          <path d="M114 400 H149 L146 556 H117 Z" fill={`url(#${id}-pant)`} stroke={LINE} strokeWidth={W} strokeLinejoin="round" />
          <path d="M122 410 L121 548" stroke="#fff" strokeOpacity="0.08" strokeWidth="6" strokeLinecap="round" />
          <path d="M118 470 Q130 476 144 468 M119 482 Q131 487 143 480" stroke="#000" strokeOpacity="0.3" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M118 540 Q131 546 145 538" stroke="#000" strokeOpacity="0.3" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
        <g data-part={`shoe${side}`}>
          {/* tan-orange lace-up boot with a dark sole */}
          <path d="M106 582 V566 Q106 550 118 548 H143 Q158 550 159 570 V582 Z" fill={`url(#${id}-boot)`} stroke={LINE} strokeWidth={W} strokeLinejoin="round" />
          <path d="M139 582 Q140 568 155 569 Q159 574 159 582 Z" fill="#9c4614" opacity="0.55" />
          <path d="M116 546 H147 V556 Q131 559 116 556 Z" fill="#c6621f" stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M120 559 H140 M120 565 H142 M120 571 H144" stroke="#f5d2a3" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M119 559 L141 571 M119 571 L140 559" stroke="#f5d2a3" strokeOpacity="0.55" strokeWidth="1.2" />
          <path d="M110 556 Q109 568 112 578" stroke="#fff" strokeOpacity="0.25" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M101 585 Q101 578 110 578 H153 Q162 578 162 585 V587 Q162 590.5 158 590.5 H105 Q101 590.5 101 587 Z" fill="#3b2216" stroke={LINE} strokeWidth={W} strokeLinejoin="round" />
          <path d="M103 582 H160" stroke="#8a5534" strokeWidth="1.4" opacity="0.8" />
        </g>
      </g>
    </g>
  );
}

function Eye({ side, cx, id }: { side: 'L' | 'R'; cx: number; id: string }) {
  return (
    <g data-part={`eye${side}`}>
      <ellipse cx={cx} cy="160" rx="12" ry="11.4" fill="#fffdfb" stroke={LINE} strokeWidth="1.5" />
      <g data-part={`pupil${side}`}>
        <circle cx={cx} cy="161" r="8.6" fill={`url(#${id}-iris)`} />
        <circle cx={cx} cy="161" r="4.6" fill="#170905" />
        <circle cx={cx - 3.2} cy="157.2" r="2.8" fill="#fff" />
        <circle cx={cx + 3} cy="164.4" r="1.3" fill="#fff" opacity="0.75" />
      </g>
      {/* heavy upper lid gives the narrowed, determined look */}
      <path d={`M${cx - 12.6} 160 Q${cx} 147 ${cx + 12.6} 160`} fill="none" stroke="#1d0c05" strokeWidth="3.2" strokeLinecap="round" />
      <path d={`M${cx - 9} 170.4 Q${cx} 173 ${cx + 9} 170.4`} fill="none" stroke="#c98a6a" strokeOpacity="0.6" strokeWidth="1.1" strokeLinecap="round" />
    </g>
  );
}

function Pod({ side, id }: { side: 'L' | 'R'; id: string }) {
  const cx = side === 'L' ? 89 : 211;
  const s = side === 'L' ? -1 : 1;
  return (
    <g data-part={`pod${side}`}>
      <ellipse cx={cx} cy="170" rx="13" ry="20" fill={`url(#${id}-pod)`} stroke={LINE} strokeWidth={W} />
      <ellipse cx={cx + s * 1.4} cy="170" rx="7.4" ry="13.6" fill="none" stroke="#ff8a2a" strokeOpacity="0.3" strokeWidth="7" />
      <ellipse cx={cx + s * 1.4} cy="170" rx="7.4" ry="13.6" fill="none" stroke="#ffa04a" strokeWidth="2.8" />
      <ellipse cx={cx + s * 1.4} cy="170" rx="3" ry="7.4" fill="#191313" />
      <path d={`M${cx + s * 9} 156 Q${cx + s * 12} 170 ${cx + s * 9} 184`} stroke="#ffd7a6" strokeOpacity="0.6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </g>
  );
}

export function Mascot2D({ state, className }: { state: RigState; className?: string }) {
  const id = useId().replace(/:/g, '');
  const ref = useRef<SVGSVGElement>(null);

  // One ticker per mascot writes the state into the SVG every frame.
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const parts = collectParts(svg);
    const render = () => renderRig(parts, state);
    render();
    gsap.ticker.add(render);
    return () => gsap.ticker.remove(render);
  }, [state]);

  return (
    <svg ref={ref} viewBox="0 0 300 600" className={className} role="img" aria-label="The Pass98 mascot" overflow="visible">
      <defs>
        <radialGradient id={`${id}-helmet`} cx="0.34" cy="0.26" r="0.85">
          <stop offset="0" stopColor="#f7a560" />
          <stop offset="0.55" stopColor="#e3782f" />
          <stop offset="1" stopColor="#b9561c" />
        </radialGradient>
        <linearGradient id={`${id}-crest`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8a35a" />
          <stop offset="1" stopColor="#d9692a" />
        </linearGradient>
        <linearGradient id={`${id}-jacket`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4934a" />
          <stop offset="0.5" stopColor="#e07530" />
          <stop offset="1" stopColor="#b6551d" />
        </linearGradient>
        <linearGradient id={`${id}-sleeve`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c45f22" />
          <stop offset="0.55" stopColor="#ea8238" />
          <stop offset="1" stopColor="#f29a52" />
        </linearGradient>
        <radialGradient id={`${id}-skin`} cx="0.45" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#fbdcc0" />
          <stop offset="1" stopColor="#ebb393" />
        </radialGradient>
        <linearGradient id={`${id}-black`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#38363c" />
          <stop offset="1" stopColor="#121114" />
        </linearGradient>
        <linearGradient id={`${id}-pant`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3a3a40" />
          <stop offset="0.45" stopColor="#26262b" />
          <stop offset="1" stopColor="#141417" />
        </linearGradient>
        <linearGradient id={`${id}-boot`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ef9348" />
          <stop offset="1" stopColor="#b85a1f" />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffdc5a" />
          <stop offset="1" stopColor="#ff9a1c" />
        </linearGradient>
        <radialGradient id={`${id}-pod`} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#4c4644" />
          <stop offset="1" stopColor="#141111" />
        </radialGradient>
        <radialGradient id={`${id}-iris`} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#b06a3a" />
          <stop offset="1" stopColor="#4c2310" />
        </radialGradient>
      </defs>

      <g data-part="flip">
        <g data-part="squash">
          <Leg side="L" id={id} />
          <Leg side="R" id={id} />

          <g data-part="body">
            {/* far arm, behind the body: only shown when he has turned side-on */}
            <g data-part="armsBack">
              <g data-part="armLback" opacity="0">
                <Arm side="L" id={id} copy="2" />
              </g>
            </g>

            <g data-part="torso">
              {/* black tee */}
              <path d="M112 250 H188 L186 396 H114 Z" fill={`url(#${id}-black)`} stroke={LINE} strokeWidth={W} strokeLinejoin="round" />
              <path d="M118 262 Q116 320 120 388" stroke="#fff" strokeOpacity="0.06" strokeWidth="7" strokeLinecap="round" />

              {/* jacket panels: orange leather, black stripe down the outer edge, ribbed hem */}
              {(['L', 'R'] as const).map((s) => (
                <g key={s} transform={s === 'R' ? 'translate(300 0) scale(-1 1)' : undefined}>
                  <path
                    d="M100 254 Q90 320 101 398 H133 L135 258 Q128 247 114 248 Z"
                    fill={`url(#${id}-jacket)`}
                    stroke={LINE}
                    strokeWidth={W}
                    strokeLinejoin="round"
                  />
                  <path d="M104 258 Q96 320 104 382" stroke={STRIPE} strokeWidth="6" fill="none" strokeLinecap="round" />
                  <path d="M114 262 Q110 300 113 340" stroke="#fff" strokeOpacity="0.2" strokeWidth="4" fill="none" strokeLinecap="round" />
                  <path d="M101 382 H133 V399 H102 Z" fill={`url(#${id}-black)`} stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
                  <Ribs x={101} y={382} w={32} h={17} n={6} />
                </g>
              ))}
              {/* chest pocket flap and a zipped hip pocket on the screen-left panel */}
              <path d="M103 286 L127 283 L128 296 L104 300 Z" fill="#c9631f" stroke={LINE} strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M107 352 L128 348" stroke="#e3e7ec" strokeWidth="2" strokeDasharray="2.2 1.6" />

              {/* popped collar: orange, edged with the black stripe, around the tee's ribbed neck */}
              <path d="M102 250 Q96 228 118 220 L136 248 L108 264 Z" fill={`url(#${id}-jacket)`} stroke={LINE} strokeWidth={W} strokeLinejoin="round" />
              <path d="M198 250 Q204 228 182 220 L164 248 L192 264 Z" fill={`url(#${id}-jacket)`} stroke={LINE} strokeWidth={W} strokeLinejoin="round" />
              <path d="M117 222 L134 248 M183 222 L166 248" stroke={STRIPE} strokeWidth="4" strokeLinecap="round" />
              <path d="M132 238 Q150 252 168 238 L166 249 Q150 263 134 249 Z" fill="#19181c" stroke={LINE} strokeWidth="1.4" strokeLinejoin="round" />

              {/* everything on his centre line moves together when he turns */}
              <g data-part="front">
                <text
                  x="150"
                  y="304"
                  textAnchor="middle"
                  fontSize="25"
                  fontWeight="800"
                  fill={`url(#${id}-gold)`}
                  stroke="#9a4700"
                  strokeWidth="0.9"
                  paintOrder="stroke"
                  style={{ fontFamily: 'var(--font-sans)', letterSpacing: '-0.5px' }}
                >
                  98
                </text>
                <path d="M134.4 258 V397 M165.6 258 V397" stroke="#e3e7ec" strokeWidth="2.4" strokeDasharray="2.4 1.7" />

                {/* belt, buckle and chain */}
                <rect x="112" y="396" width="76" height="13" rx="2.6" fill="#6e4021" stroke={LINE} strokeWidth={W} />
                <path d="M115 402.5 H185" stroke="#c48b5a" strokeOpacity="0.55" strokeWidth="1.1" strokeDasharray="3 2.4" />
                <rect x="140.5" y="397.5" width="19" height="10" rx="1.8" fill="none" stroke="#d9dde3" strokeWidth="2.4" />
                <path d="M150 399 V406" stroke="#d9dde3" strokeWidth="1.8" />
                <path d="M174 408 C168 432 176 458 190 462 C202 456 200 430 190 410" fill="none" stroke="#4a5058" strokeWidth="6" strokeLinecap="round" />
                <path d="M174 408 C168 432 176 458 190 462 C202 456 200 430 190 410" fill="none" stroke="#e6e9ee" strokeWidth="4" strokeLinecap="round" strokeDasharray="4.4 2.4" />
              </g>
            </g>

            {/* head */}
            <g data-part="head">
              {/* the far ear pod sits behind the helmet so it can slip out of sight as he turns */}
              <Pod side="L" id={id} />

              {/* contact shadow of the head on the collar */}
              <ellipse cx="150" cy="232" rx="54" ry="9" fill="#000" opacity="0.28" />

              {/* helmet shell, with a rim light and a soft lower shadow */}
              <path
                d="M92 116 Q90 72 130 66 L172 64 Q210 68 210 110 L210 200 Q210 226 184 230 L116 230 Q90 226 90 200 Z"
                fill={`url(#${id}-helmet)`}
                stroke={LINE}
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path d="M102 106 Q105 82 130 76 L152 74 Q122 86 112 116 Z" fill="#fff" opacity="0.26" />
              <path d="M200 98 Q206 120 204 160" stroke="#fff" strokeOpacity="0.16" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M96 214 Q150 234 204 214" stroke="#8a3a12" strokeOpacity="0.35" strokeWidth="5" fill="none" strokeLinecap="round" />

              <Pod side="R" id={id} />

              {/* face */}
              <g data-part="face">
                <path
                  d="M106 140 Q106 118 128 116 H172 Q194 118 194 140 V188 Q194 214 168 218 H132 Q106 214 106 188 Z"
                  fill={`url(#${id}-skin)`}
                  stroke={LINE}
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                {/* the brim's shadow on the forehead, soft cheek colour, jaw shading */}
                <path d="M106 140 Q106 118 128 116 H172 Q194 118 194 140 V150 Q150 134 106 150 Z" fill="#8c3d14" opacity="0.28" />
                <path d="M108 196 Q112 214 132 217 H168 Q188 214 192 196 Q150 222 108 196 Z" fill="#c98663" opacity="0.25" />
                <ellipse cx="121" cy="184" rx="8.5" ry="5" fill="#f0886c" opacity="0.28" />
                <ellipse cx="179" cy="184" rx="8.5" ry="5" fill="#f0886c" opacity="0.28" />

                <Eye side="L" cx={130} id={id} />
                <Eye side="R" cx={170} id={id} />

                {/* thick tapered brows, heavy at the inner end */}
                <path data-part="browL" d="M113 141 C124 139 135 142 146 146 Q149 151 145 155 C135 150 124 146 113 145 Z" fill="#170a05" />
                <path data-part="browR" d="M187 141 C176 139 165 142 154 146 Q151 151 155 155 C165 150 176 146 187 145 Z" fill="#170a05" />

                {/* small rounded nose */}
                <ellipse cx="150" cy="176" rx="4.8" ry="3.6" fill="#e4a27f" opacity="0.85" />
                <path d="M146.6 179.4 Q150 182.6 153.4 179.4" stroke="#c4836a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <ellipse cx="148.8" cy="174.8" rx="1.9" ry="1.2" fill="#fff" opacity="0.55" />

                {/* mouths: smirk (default), open grin, gritted teeth */}
                <g data-part="mouth0">
                  <path d="M137 194 Q152 199.5 165 190" stroke="#76321f" strokeWidth="2.3" fill="none" strokeLinecap="round" />
                  <path d="M165 190 Q169 188.6 170 185" stroke="#76321f" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                  <path d="M143 200 Q151 202.5 158 199.5" stroke="#d48f72" strokeOpacity="0.55" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                </g>
                <g data-part="mouth1" opacity="0">
                  <path d="M135 191 Q151 217 167 191 Q151 196 135 191 Z" fill="#3b0e08" stroke="#2a0a05" strokeWidth="1.6" strokeLinejoin="round" />
                  <ellipse cx="151" cy="204" rx="8" ry="4" fill="#e0556b" />
                  <path d="M138 192 Q151 197 164 192" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                </g>
                <g data-part="mouth2" opacity="0">
                  <path d="M136 192 H166 Q168 202 158 204 H144 Q134 202 136 192 Z" fill="#fff" stroke="#3b0e08" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M143 192 V203 M151 192 V204 M159 192 V203" stroke="#3b0e08" strokeWidth="1.3" />
                </g>
              </g>

              {/* the logo swoosh crest, chunky and the same matte orange as the helmet */}
              <g data-part="crest">
                <path
                  d="M122 72 L148 104 Q154 109 158 101 Q164 66 174 44 Q180 33 190 39 L214 40"
                  fill="none"
                  stroke={LINE}
                  strokeWidth="19"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M122 72 L148 104 Q154 109 158 101 Q164 66 174 44 Q180 33 190 39 L214 40"
                  fill="none"
                  stroke={`url(#${id}-crest)`}
                  strokeWidth="15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M126 74 L146 98 M170 48 Q176 38 186 40" stroke="#fff" strokeOpacity="0.3" strokeWidth="3" strokeLinecap="round" fill="none" />
                <circle cx="113" cy="96" r="9.6" fill={LINE} />
                <circle cx="113" cy="96" r="7.6" fill={`url(#${id}-crest)`} />
              </g>
            </g>

            {/* arms in front, drawn last so a raised hand is in front of the head */}
            <g data-part="armsFront">
              <g data-part="armLfront">
                <Arm side="L" id={id} />
              </g>
              <Arm side="R" id={id} />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
