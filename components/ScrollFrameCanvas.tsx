"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FRAME_COUNT } from "@/lib/frames";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  images: HTMLImageElement[];
  /** How many viewport-heights of scroll to spend scrubbing the sequence. */
  scrollLengthVh?: number;
  onFrameChange?: (frame: number) => void;
}

/**
 * Step 3 — Canvas component
 * Step 5 — GSAP ScrollTrigger
 *
 * The canvas is pinned full-screen for `scrollLengthVh` viewport-heights.
 * ScrollTrigger's `onUpdate` gives a 0-1 progress value which we map to a
 * frame index and draw with `drawImage`, using object-fit: cover math so the
 * source footage always fills the viewport without distortion.
 *
 * Performance notes (Step 10 ties in here too):
 *   - We never draw on every scroll event directly — ScrollTrigger already
 *     batches reads to the animation frame via its own ticker, so this stays
 *     at display refresh rate instead of scroll-event rate.
 *   - We skip re-drawing if the computed frame index hasn't changed.
 *   - The backing store resolution is capped at devicePixelRatio 2 to avoid
 *     giant canvases on high-DPI displays tanking fill-rate.
 *   - Resize is handled via ResizeObserver + a rAF-debounced redraw, not a
 *     scroll or window resize listener firing synchronously.
 */
export default function ScrollFrameCanvas({ images, scrollLengthVh = 400, onFrameChange }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentFrame = useRef(0);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const draw = (frame: number) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const img = images[frame];
    if (!canvas || !ctx || !img || !img.complete || img.naturalWidth === 0) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // object-fit: cover
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = canvas.getContext("2d");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      draw(currentFrame.current);
    };

    resize();
    const ro = new ResizeObserver(() => requestAnimationFrame(resize));
    ro.observe(document.documentElement);

    // Draw frame 0 as soon as it's available, before any scroll happens.
    draw(0);

    const trigger = ScrollTrigger.create({
      trigger: wrapperRef.current,
      start: "top top",
      end: `+=${scrollLengthVh}%`,
      pin: true,
      pinSpacing: true,
      scrub: 0.4, // slight easing so the scrub feels less mechanical
      onUpdate: (self) => {
        const frame = Math.min(FRAME_COUNT - 1, Math.floor(self.progress * FRAME_COUNT));
        if (frame !== currentFrame.current) {
          currentFrame.current = frame;
          draw(frame);
          onFrameChange?.(frame);
        }
      },
    });

    return () => {
      ro.disconnect();
      trigger.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  return (
    <div ref={wrapperRef} className="relative h-screen w-full overflow-hidden bg-ink">
      <canvas ref={canvasRef} className="absolute inset-0 block" />
    </div>
  );
}
