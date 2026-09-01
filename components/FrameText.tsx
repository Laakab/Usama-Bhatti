"use client";

import { FRAME_CUES } from "@/lib/frames";

/* ─── helpers ─────────────────────────────────────────────── */

/** Split a string into words, keeping whitespace intent */
function words(str: string) {
  return str.split(" ").filter(Boolean);
}

/** Clamp 0→1 */
function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

/* ─────────────────────────────────────────────────────────── */

export default function FrameText({ frame }: { frame: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {FRAME_CUES.map((cue) => {
        const span       = cue.end - cue.start;
        const fadeWindow = Math.max(4, Math.round(span * 0.15));

        /* overall cue opacity (shared fade-in / fade-out) */
        let cueOpacity = 0;
        if (frame >= cue.start && frame <= cue.end) {
          const inFade  = clamp01((frame - cue.start)  / fadeWindow);
          const outFade = clamp01((cue.end   - frame)   / fadeWindow);
          cueOpacity = Math.min(inFade, outFade);
        }

        /* ── INTRO cue — staggered word animation ── */
        if (cue.id === "intro") {
          const localFrame = frame - cue.start; // 0 … span

          /* timings (in local frames) */
          const EYEBROW_IN   = 0;   // eyebrow starts sliding in
          const EYEBROW_DUR  = 6;
          const TITLE_IN     = 5;   // title words start
          const TITLE_WORD_STEP = 3;// frames between each word
          const BODY_IN      = 20;  // body fades in
          const BODY_DUR     = 5;

          const titleWords = words(cue.title);

          /* eyebrow */
          const eyebrowProgress = clamp01((localFrame - EYEBROW_IN) / EYEBROW_DUR);
          const eyebrowY  = 14 * (1 - eyebrowProgress);
          const eyebrowOp = eyebrowProgress * cueOpacity;

          /* body */
          const bodyProgress = clamp01((localFrame - BODY_IN) / BODY_DUR);
          const bodyY  = 10 * (1 - bodyProgress);
          const bodyOp = bodyProgress * cueOpacity;

          return (
            <div
              key={cue.id}
              className="absolute inset-x-0 top-0 flex h-full items-center px-8 text-left md:px-16"
            >
              <div className="max-w-xl">
                {/* eyebrow */}
                <p
                  className="mb-3 font-body text-xs tracking-widest uppercase text-signal"
                  style={{
                    opacity:   eyebrowOp,
                    transform: `translateY(${eyebrowY}px)`,
                  }}
                >
                  {cue.eyebrow}
                </p>

                {/* title — word by word */}
                <h2 className="font-display text-5xl italic leading-[1.05] text-paper md:text-7xl">
                  {titleWords.map((word, wi) => {
                    const wordIn  = TITLE_IN + wi * TITLE_WORD_STEP;
                    const wordDur = 5;
                    const prog    = clamp01((localFrame - wordIn) / wordDur);

                    /* each word slides up + fades in */
                    const wY  = 28 * (1 - prog);
                    const wOp = prog * cueOpacity;

                    return (
                      <span
                        key={wi}
                        className="inline-block"
                        style={{
                          opacity:   wOp,
                          transform: `translateY(${wY}px)`,
                          marginRight: wi < titleWords.length - 1 ? "0.28em" : 0,
                        }}
                      >
                        {word}
                      </span>
                    );
                  })}
                </h2>

                {/* accent line under name */}
                <div
                  className="mt-3 h-px bg-signal origin-left"
                  style={{
                    transform:  `scaleX(${clamp01((localFrame - TITLE_IN + 2) / 10) * cueOpacity})`,
                    opacity:    cueOpacity,
                    width:      "100%",
                    maxWidth:   320,
                  }}
                />

                {/* body */}
                {cue.body && cue.body !== "contact" && (
                  <p
                    className="mt-5 max-w-sm font-body text-sm leading-relaxed text-fog"
                    style={{
                      opacity:   bodyOp,
                      transform: `translateY(${bodyY}px)`,
                    }}
                  >
                    {cue.body}
                  </p>
                )}
              </div>
            </div>
          );
        }

        /* ── All other cues — original smooth fade/slide ── */
        const translateY = 16 * (1 - cueOpacity);

        return (
          <div
            key={cue.id}
            className={`absolute inset-x-0 top-0 flex h-full items-center px-8 md:px-16 ${
              cue.align === "left" ? "justify-start text-left" : "justify-end text-right"
            }`}
            style={{
              opacity:   cueOpacity,
              transform: `translateY(${translateY}px)`,
            }}
          >
            <div className="max-w-md">
              {cue.eyebrow && (
                <p className="mb-3 font-body text-xs text-fog">{cue.eyebrow}</p>
              )}
              <h2 className="whitespace-pre-line font-display text-4xl italic leading-[1.05] text-paper md:text-6xl">
                {cue.title}
              </h2>

              {/* Contact button */}
              {cue.body === "contact" && (
                <div
                  className={`mt-6 ${cue.align === "right" ? "flex justify-end" : ""}`}
                  style={{ pointerEvents: cueOpacity > 0.5 ? "auto" : "none" }}
                >
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 rounded-full border border-signal bg-signal/10 px-6 py-3 font-body text-sm text-signal backdrop-blur-sm transition-all duration-300 hover:bg-signal hover:text-ink"
                  >
                    <span>✉</span>
                    Contact Me
                  </a>
                </div>
              )}

              {/* Regular body text */}
              {cue.body && cue.body !== "contact" && (
                <p className="mt-4 max-w-xs font-body text-sm text-fog">{cue.body}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
