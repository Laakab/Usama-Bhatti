"use client";

import { FRAME_CUES } from "@/lib/frames";

function words(str: string) {
  return str.split(" ").filter(Boolean);
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

export default function FrameText({ frame }: { frame: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {FRAME_CUES.map((cue) => {
        const span       = cue.end - cue.start;
        const fadeWindow = Math.max(4, Math.round(span * 0.15));

        let cueOpacity = 0;
        if (frame >= cue.start && frame <= cue.end) {
          const inFade  = clamp01((frame - cue.start) / fadeWindow);
          const outFade = clamp01((cue.end - frame)   / fadeWindow);
          cueOpacity = Math.min(inFade, outFade);
        }

        /* ══ INTRO — staggered word animation ══ */
        if (cue.id === "intro") {
          const localFrame      = frame - cue.start;
          const EYEBROW_IN      = 0;
          const EYEBROW_DUR     = 6;
          const TITLE_IN        = 5;
          const TITLE_WORD_STEP = 3;
          const BODY_IN         = 20;
          const BODY_DUR        = 5;

          const titleWords = words(cue.title);

          const eyebrowProgress = clamp01((localFrame - EYEBROW_IN) / EYEBROW_DUR);
          const eyebrowY  = 12 * (1 - eyebrowProgress);
          const eyebrowOp = eyebrowProgress * cueOpacity;

          const bodyProgress = clamp01((localFrame - BODY_IN) / BODY_DUR);
          const bodyY  = 8 * (1 - bodyProgress);
          const bodyOp = bodyProgress * cueOpacity;

          return (
            <div
              key={cue.id}
              className="hero-intro-text absolute inset-x-0 top-0 flex h-full px-5 text-left sm:items-center sm:px-8 md:px-16"
            >
              {/* constrain width so text never bleeds off-screen */}
              <div className="w-full max-w-[min(440px,90vw)]">

                {/* eyebrow */}
                <p
                  className="mb-2 font-body text-[10px] tracking-widest uppercase text-signal sm:text-xs"
                  style={{ opacity: eyebrowOp, transform: `translateY(${eyebrowY}px)` }}
                >
                  {cue.eyebrow}
                </p>

                {/* title — word by word, fluid size */}
                <h2 className="font-display italic leading-[1.05] text-paper
                               text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
                  {titleWords.map((word, wi) => {
                    const prog = clamp01((localFrame - (TITLE_IN + wi * TITLE_WORD_STEP)) / 5);
                    return (
                      <span
                        key={wi}
                        className="inline-block"
                        style={{
                          opacity:     prog * cueOpacity,
                          transform:   `translateY(${24 * (1 - prog)}px)`,
                          marginRight: wi < titleWords.length - 1 ? "0.25em" : 0,
                        }}
                      >
                        {word}
                      </span>
                    );
                  })}
                </h2>

                {/* gold accent line */}
                <div
                  className="mt-2 h-px bg-signal origin-left"
                  style={{
                    transform: `scaleX(${clamp01((localFrame - TITLE_IN + 2) / 10) * cueOpacity})`,
                    opacity:   cueOpacity,
                    maxWidth:  "min(280px, 80vw)",
                    width:     "100%",
                  }}
                />

                {/* body */}
                {cue.body && cue.body !== "contact" && (
                  <p
                    className="mt-3 font-body text-xs leading-relaxed text-fog sm:text-sm"
                    style={{ opacity: bodyOp, transform: `translateY(${bodyY}px)` }}
                  >
                    {cue.body}
                  </p>
                )}
              </div>
            </div>
          );
        }

        /* ══ ALL OTHER CUES ══ */
        const translateY = 14 * (1 - cueOpacity);

        return (
          <div
            key={cue.id}
            className={`hero-cue-text absolute inset-x-0 top-0 flex h-full
              px-5 sm:items-center sm:px-8 md:px-16
              ${cue.align === "left" ? "justify-start text-left" : "justify-end text-right"}`}
            style={{ opacity: cueOpacity, transform: `translateY(${translateY}px)` }}
          >
            {/* constrain so text never runs off on narrow screens */}
            <div className="w-full max-w-[min(380px,88vw)]">

              {cue.eyebrow && (
                <p className="mb-2 font-body text-[10px] uppercase tracking-wider text-fog sm:text-xs">
                  {cue.eyebrow}
                </p>
              )}

              <h2 className="whitespace-pre-line font-display italic leading-[1.05] text-paper
                             text-2xl sm:text-4xl md:text-5xl lg:text-6xl">
                {cue.title}
              </h2>

              {/* Contact button */}
              {cue.body === "contact" && (
                <div
                  className={`mt-4 sm:mt-6 ${cue.align === "right" ? "flex justify-end" : ""}`}
                  style={{ pointerEvents: cueOpacity > 0.5 ? "auto" : "none" }}
                >
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 rounded-full border border-signal
                               bg-signal/10 px-4 py-2 font-body text-xs text-signal
                               backdrop-blur-sm transition-all duration-300
                               hover:bg-signal hover:text-ink
                               sm:px-6 sm:py-3 sm:text-sm"
                  >
                    <span>✉</span>
                    Contact Me
                  </a>
                </div>
              )}

              {/* Regular body */}
              {cue.body && cue.body !== "contact" && (
                <p className="mt-3 font-body text-xs leading-relaxed text-fog sm:text-sm">
                  {cue.body}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
