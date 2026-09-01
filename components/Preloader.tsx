"use client";

import { useEffect, useState } from "react";
import { frameSrc, FRAME_COUNT } from "@/lib/frames";

/**
 * Step 4 — Preloader
 *
 * Scroll-scrubbed canvas animation only feels premium if every frame is
 * already decoded before the user starts scrolling — otherwise the first
 * scrub shows blank/half-loaded frames. This component:
 *   1. Kicks off all FRAME_COUNT image loads in parallel.
 *   2. Reports real progress (not a fake timer) via a ref count.
 *   3. Hands the decoded HTMLImageElement[] array up to the page once done,
 *      so ScrollFrameCanvas never re-fetches them.
 *   4. Fails soft: a single broken frame won't hang the preloader forever.
 */
export default function Preloader({
  onLoaded,
}: {
  onLoaded: (images: HTMLImageElement[]) => void;
}) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const images: HTMLImageElement[] = new Array(FRAME_COUNT);
    let loaded = 0;

    const settle = () => {
      loaded += 1;
      if (cancelled) return;
      setProgress(Math.round((loaded / FRAME_COUNT) * 100));
      if (loaded === FRAME_COUNT) {
        setDone(true);
        // Small pause so the "100%" state is perceptible before the reveal.
        setTimeout(() => !cancelled && onLoaded(images), 350);
      }
    };

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = "async";
      img.onload = settle;
      img.onerror = settle; // don't let one bad frame block the whole scene
      img.src = frameSrc(i);
      images[i] = img;
    }

    return () => {
      cancelled = true;
    };
  }, [onLoaded]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink transition-opacity duration-500 ${
        done ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden={done}
    >
      <p className="mb-6 font-display text-sm italic tracking-tight text-fog">Vision</p>
      <div className="h-px w-48 overflow-hidden bg-line/60">
        <div
          className="h-full bg-paper transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-4 font-body text-xs tabular-nums text-fog">{progress}%</p>
    </div>
  );
}
