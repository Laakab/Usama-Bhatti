"use client";

import { useEffect, useRef } from "react";

/**
 * Step 9 — Premium effects (1/2): film grain
 *
 * A tiny (64x64) noise pattern, scaled up and re-randomized a few times a
 * second — not every frame. This is deliberately restrained: it reinforces
 * the photographic subject matter (matches the moody, grainy portrait
 * reference) without becoming a distracting animated texture.
 */
export default function Grain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SIZE = 64;
    canvas.width = SIZE;
    canvas.height = SIZE;

    let raf: number;
    let last = 0;

    const render = (t: number) => {
      raf = requestAnimationFrame(render);
      if (t - last < 90) return; // ~11fps of grain change is plenty
      last = t;

      const imageData = ctx.createImageData(SIZE, SIZE);
      const buffer = imageData.data;
      for (let i = 0; i < buffer.length; i += 4) {
        const shade = Math.random() * 255;
        buffer[i] = shade;
        buffer[i + 1] = shade;
        buffer[i + 2] = shade;
        buffer[i + 3] = 14; // very low alpha — texture, not noise
      }
      ctx.putImageData(imageData, 0, 0);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 h-full w-full mix-blend-overlay"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
