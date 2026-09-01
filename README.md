# Vision — Scroll-Driven Portfolio

A single-page Next.js portfolio built around a scroll-scrubbed video sequence,
in the style of Apple's product pages: you scroll, and a canvas plays back a
frame sequence in sync with scroll position, with text and content timed to
specific moments in the footage.

Your uploaded video (`Remove_Text__And_Object_displa.mp4`, 1280×720, 10s,
24fps) has already been processed: **150 WebP frames live in
`public/frames/`, totaling ~1.7MB.** The site runs out of the box against
your real footage — nothing here is a placeholder.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. First load will show the preloader (Step 4)
until all 150 frames are decoded, then the scroll sequence takes over.

## The 10 steps, and where each one lives

**1. Video → optimized WebP frames** — `scripts/extract-frames.mjs`
Uses `ffmpeg` to sample N evenly-spaced frames from a source video, then
`sharp` to resize + re-encode each as WebP. Already run once against your
video (150 frames, 1280px wide, quality 72 → ~11KB/frame). Re-run it any
time you swap the source video:
```bash
node scripts/extract-frames.mjs path/to/new-video.mp4
```
Then update `FRAME_COUNT` in `lib/frames.ts` to match if the frame count
changes.

**2. `/public/frames`** — Next.js serves everything under `public/` at the
root path, so `public/frames/frame_0001.webp` is fetched as `/frames/
frame_0001.webp`. `lib/frames.ts` is the single place that knows the
naming/padding convention (`frame_0001.webp` … `frame_0150.webp`) — nothing
else hardcodes it.

**3. Canvas component** — `components/ScrollFrameCanvas.tsx`
Draws the current frame to a `<canvas>` with `object-fit: cover` math, sized
to a capped device-pixel-ratio so 4K/Retina screens don't tank fill-rate.

**4. Preloader** — `components/Preloader.tsx`
Loads all 150 images in parallel before reveal, with a real (not
simulated) progress bar. Fails soft — one broken frame won't hang it.

**5. GSAP ScrollTrigger** — also in `components/ScrollFrameCanvas.tsx`
The canvas wrapper is pinned for 400vh of scroll (`scrollLengthVh` prop).
`onUpdate` converts scroll progress (0–1) into a frame index and redraws
only when the index actually changes.

**6. Smooth scrolling / Lenis** — `components/SmoothScroll.tsx`
Lenis is driven from GSAP's own ticker so both stay on one frame clock, and
`ScrollTrigger.scrollerProxy` is wired to Lenis so pinned sections don't
jitter against the smoothed scroll. Falls back to native scroll under
`prefers-reduced-motion`.

**7. Frame-based text timing** — `lib/frames.ts` (the `FRAME_CUES` array)
+ `components/FrameText.tsx`
Copy is cued to *frame numbers*, not pixel offsets, with a soft fade-in/out
window — so it survives changes to scroll length or viewport height. Edit
`FRAME_CUES` to change what appears when.

**8. Buttons + project cards** — `components/Buttons.tsx`,
`components/ProjectCard.tsx`
Project thumbnails were cropped from your uploaded reference sheet
(`public/images/quad-1.webp` … `quad-4.webp`) as a starting point — swap in
your real project images at the same paths/aspect ratio (4:5).

**9. Premium effects** — `components/Grain.tsx` (film-grain overlay,
matching the moody reference image) and the magnetic-pull hover in
`components/Buttons.tsx`. Deliberately just two effects, not one per
element — see the design note below.

**10. Performance optimization** — spread throughout, specifically:
- Frames are pre-decoded once (Preloader), never re-fetched during scroll.
- Canvas redraws are skipped when the computed frame index hasn't changed.
- Backing store resolution capped at devicePixelRatio 2.
- Resize handled via `ResizeObserver` + `requestAnimationFrame`, not a raw
  `resize` listener.
- Grain overlay updates at ~11fps instead of every animation frame — it's a
  texture, not real noise.
- `prefers-reduced-motion` disables Lenis smoothing entirely.

## Design decisions

- **Palette**: near-black stage (`#0a0a0a`), warm off-white text (`#ededea`),
  a single muted brass accent (`#c9a24b`) used only for text selection and
  focus rings — not decoration.
- **Type**: Fraunces (display, italic) for headlines paired with Inter
  (body/UI) — an editorial serif/grotesk pairing that matches the magazine-
  style treatment of your reference image, not a generic SaaS font stack.
- **Project cards** are full-bleed images with a hairline rule and a
  magazine credit line (title / category / year), not rounded cards with
  drop shadows.
- Motion is spent in two places only — the grain texture and the magnetic
  button — everything else is still. Restraint was a deliberate choice, not
  an oversight.

## Customizing

- Swap the video: re-run `extract-frames.mjs`, update `FRAME_COUNT`.
- Change scroll length: `scrollLengthVh` prop on `<ScrollFrameCanvas>` in
  `app/page.tsx` (currently 400, i.e. 4 viewport-heights of scroll).
- Edit copy/timing: `FRAME_CUES` in `lib/frames.ts`.
- Replace project images: drop new files in `public/images/` and update the
  `PROJECTS` array in `app/page.tsx`.
- Email/contact link: the `mailto:` href in `app/page.tsx`.
