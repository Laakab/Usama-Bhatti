"use client";

import { useRef } from "react";
import gsap from "gsap";

/**
 * Step 8 — Buttons
 * Step 9 — Premium effects (2/2): magnetic pull on hover
 *
 * The button nudges toward the cursor within its own bounds, then springs
 * back on leave. This is the one hover flourish on the page — used only
 * here, deliberately, rather than scattered across every interactive
 * element (see the design note in the README about restraint).
 */
export default function MagneticButton({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: "power3.out" });
  };

  const handleLeave = () => {
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
  };

  return (
    <a
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 font-body text-sm text-paper transition-colors hover:border-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
    >
      {children}
    </a>
  );
}
