// Single source of truth for the scroll-driven frame sequence.
// Keep this in sync with whatever `scripts/extract-frames.mjs` produced.

export const FRAME_COUNT  = 150;
export const FRAME_FOLDER = "/frames";
export const FRAME_PREFIX = "frame_";
export const FRAME_PAD    = 4; // frame_0001.webp …

/** Build the public path for a given frame index (0-based). */
export function frameSrc(index: number): string {
  const n      = Math.min(Math.max(index, 0), FRAME_COUNT - 1) + 1;
  const padded = String(n).padStart(FRAME_PAD, "0");
  return `${FRAME_FOLDER}/${FRAME_PREFIX}${padded}.webp`;
}

// ─── Scroll speed maths ─────────────────────────────────────────────────────
//   scrollLengthVh = 400   →   400vh total scroll for 150 frames
//   1 frame ≈ 2.67 vh
//   Comfortable reading scroll ≈ 100 vh / sec
//   → 1 second of scroll ≈ 37–38 frames
//
//   Each cue therefore follows this rhythm:
//     [~1 sec intro delay]  [~1 sec visible]  [~0.5 sec outro / gap to next]
//
//   Cue layout across 150 frames:
//   ┌────────┬──────┬───────────────┬──────┐
//   │  INTRO │ HOLD │   DISPLAY     │ FADE │
//   └────────┴──────┴───────────────┴──────┘
//
//   Cue 1  "Usama Bhatti."          : 0  – 38   (starts immediately, full intro)
//   Cue 2  "React. Next.js. …"      : 45 – 88   (≈1 sec gap after cue 1 ends)
//   Cue 3  "Ideas turned …"         : 95 – 128  (≈1 sec gap after cue 2 ends)
//   Cue 4  "Let's build …"          : 133 – 150 (≈1 sec gap after cue 3 ends)
// ────────────────────────────────────────────────────────────────────────────

export interface FrameCue {
  id: string;
  start: number;
  end: number;
  eyebrow?: string;
  title: string;
  body?: string;
  align: "left" | "right";
}

export const FRAME_CUES: FrameCue[] = [
  {
    // ── CUE 1 ── frames 0 – 38  (~1 sec full intro animation)
    // Staggered word-by-word animation handled in FrameText.tsx
    // Eyebrow → word 1 → word 2 → accent line → body — each ~3–5 frames apart
    id: "intro",
    start: 0,
    end: 38,
    eyebrow: "Full Stack Developer · Lahore, Pakistan",
    title: "Usama Bhatti.",
    body: "Building modern web experiences from frontend to backend.",
    align: "left",
  },
  {
    // ── CUE 2 ── frames 45 – 88  (~1 sec delay after cue 1, ~1 sec display)
    id: "stack",
    start: 45,
    end: 88,
    eyebrow: "Tech Stack",
    title: "React. Next.js.\nNode. Python.",
    body: "Crafting fast, scalable applications with modern tools.",
    align: "right",
  },
  {
    // ── CUE 3 ── frames 95 – 128  (~1 sec delay, ~1 sec display)
    id: "projects",
    start: 95,
    end: 128,
    eyebrow: "Selected Projects",
    title: "Ideas turned\ninto products.",
    body: "MERN ecommerce, AI chatbots, virtual try-on & more.",
    align: "left",
  },
  {
    // ── CUE 4 ── frames 133 – 150  (~1 sec delay, holds to end)
    id: "contact",
    start: 133,
    end: 150,
    eyebrow: "Available for hire",
    title: "Let's build\nsomething great.",
    body: "contact",
    align: "right",
  },
];
