"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";

/* ─────────────────────────── types ─────────────────────────── */

export interface SkillNode {
  id: string;
  label: string;
  icon?: string;
  tooltip?: string;
}

export interface CategoryNode {
  id: string;
  label: string;
  icon: string;
  color: string;        // tailwind border/text accent colour
  glowColor: string;    // rgba for box-shadow glow
  skills: SkillNode[];
}

export interface MindMapData {
  root: { label: string };
  categories: CategoryNode[];
}

/* ─────────────────────────── data ─────────────────────────── */

export const MIND_MAP_DATA: MindMapData = {
  root: { label: "FRONTEND\nDEVELOPMENT" },
  categories: [
    {
      id: "languages",
      label: "Frontend Languages",
      icon: "🎨",
      color: "#c9a24b",
      glowColor: "rgba(201,162,75,0.35)",
      skills: [
        { id: "html5",  label: "HTML5",           icon: "🌐", tooltip: "Semantic markup & structure" },
        { id: "css3",   label: "CSS3",            icon: "🎨", tooltip: "Styling & visual design" },
        { id: "js",     label: "JavaScript ES6+", icon: "⚡", tooltip: "Modern JS with ES modules" },
      ],
    },
    {
      id: "frameworks",
      label: "Frameworks & Libraries",
      icon: "⚛️",
      color: "#61dafb",
      glowColor: "rgba(97,218,251,0.30)",
      skills: [
        { id: "react",  label: "React.js",  icon: "⚛️", tooltip: "Component-driven UI" },
        { id: "nextjs", label: "Next.js",   icon: "▲",  tooltip: "Full-stack React framework" },
      ],
    },
    {
      id: "css-ui",
      label: "CSS & UI",
      icon: "🖌️",
      color: "#38bdf8",
      glowColor: "rgba(56,189,248,0.30)",
      skills: [
        { id: "tailwind",  label: "Tailwind CSS", icon: "💨", tooltip: "Utility-first CSS" },
        { id: "bootstrap", label: "Bootstrap",    icon: "🅱️", tooltip: "Component CSS framework" },
      ],
    },
    {
      id: "animation",
      label: "Animation & Interactive",
      icon: "✨",
      color: "#a78bfa",
      glowColor: "rgba(167,139,250,0.30)",
      skills: [
        { id: "gsap",  label: "GSAP",              icon: "🟢", tooltip: "Professional JS animation" },
        { id: "framer",label: "Framer Motion",     icon: "🎭", tooltip: "React animation library" },
        { id: "three", label: "Three.js",          icon: "🔷", tooltip: "3D WebGL rendering" },
        { id: "r3f",   label: "React Three Fiber", icon: "🌐", tooltip: "React renderer for Three.js" },
      ],
    },
    {
      id: "tools",
      label: "Frontend Tools",
      icon: "🛠️",
      color: "#fb923c",
      glowColor: "rgba(251,146,60,0.30)",
      skills: [
        { id: "vite", label: "Vite", icon: "⚡", tooltip: "Lightning fast build tool" },
        { id: "npm",  label: "npm",  icon: "📦", tooltip: "Node package manager" },
        { id: "pnpm", label: "pnpm", icon: "📦", tooltip: "Fast, disk-efficient package manager" },
      ],
    },
    {
      id: "api",
      label: "API & State Management",
      icon: "🔌",
      color: "#34d399",
      glowColor: "rgba(52,211,153,0.30)",
      skills: [
        { id: "rest",    label: "REST API",   icon: "🔗", tooltip: "RESTful HTTP services" },
        { id: "axios",   label: "Axios",      icon: "📡", tooltip: "Promise-based HTTP client" },
        { id: "fetch",   label: "Fetch API",  icon: "🌊", tooltip: "Native browser fetch" },
        { id: "context", label: "Context API",icon: "🔄", tooltip: "React state management" },
      ],
    },
    {
      id: "webdev",
      label: "Web Development",
      icon: "📱",
      color: "#f472b6",
      glowColor: "rgba(244,114,182,0.30)",
      skills: [
        { id: "rwd",    label: "Responsive Web Design",    icon: "📐", tooltip: "Fluid layouts for all screens" },
        { id: "mobile", label: "Mobile-First Development", icon: "📱", tooltip: "Design for mobile first" },
      ],
    },
  ],
};

/* ─────────────────────────── helpers ─────────────────────────── */

/** Evenly space categories in a full circle around the root */
function getCategoryAngle(index: number, total: number): number {
  return (index / total) * 2 * Math.PI - Math.PI / 2;
}

/** Get x,y of a point at distance r and angle a from cx,cy */
function polar(cx: number, cy: number, r: number, a: number) {
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

/* ─────────────────────────── component ─────────────────────────── */

export default function SkillsMindMap({ data = MIND_MAP_DATA }: { data?: MindMapData }) {
  const [rootExpanded, setRootExpanded]         = useState(false);
  const [expandedCats, setExpandedCats]         = useState<Set<string>>(new Set());
  const [hoveredSkill, setHoveredSkill]         = useState<string | null>(null);
  const [tooltip, setTooltip]                   = useState<{ x: number; y: number; text: string } | null>(null);
  const [activeCat, setActiveCat]               = useState<string | null>(null);
  const svgRef                                  = useRef<SVGSVGElement>(null);

  /* ── layout constants (scale with viewport) ── */
  const W  = 900;
  const H  = 900;
  const cx = W / 2;
  const cy = H / 2;
  const ROOT_R    = 62;
  const CAT_R     = 180;   // orbit radius for categories
  const SKILL_R   = 100;   // additional radius beyond category for skills

  const categories = data.categories;
  const total      = categories.length;

  /* ── toggle helpers ── */
  const toggleRoot = () => {
    setRootExpanded((v) => {
      if (v) {
        setExpandedCats(new Set());
        setActiveCat(null);
      }
      return !v;
    });
  };

  const toggleCat = (id: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); if (activeCat === id) setActiveCat(null); }
      else               { next.add(id);    setActiveCat(id); }
      return next;
    });
  };

  const expandAll = () => {
    setRootExpanded(true);
    setExpandedCats(new Set(categories.map((c) => c.id)));
  };

  const collapseAll = () => {
    setRootExpanded(false);
    setExpandedCats(new Set());
    setActiveCat(null);
  };

  /* ── skill hover tooltip ── */
  const handleSkillEnter = useCallback(
    (e: React.MouseEvent<SVGGElement>, skill: SkillNode) => {
      if (!skill.tooltip) return;
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      setHoveredSkill(skill.id);
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 12,
        text: skill.tooltip,
      });
    },
    [],
  );

  const handleSkillLeave = useCallback(() => {
    setHoveredSkill(null);
    setTooltip(null);
  }, []);

  /* ── pre-compute positions ── */
  const layout = useMemo(() => {
    return categories.map((cat, i) => {
      const angle    = getCategoryAngle(i, total);
      const catPos   = polar(cx, cy, CAT_R, angle);

      const skillCount = cat.skills.length;
      const spread     = Math.min(Math.PI * 0.55, (skillCount * 0.4));
      const startAngle = angle - spread / 2;

      const skills = cat.skills.map((skill, si) => {
        const sa  = skillCount === 1 ? angle : startAngle + (si / (skillCount - 1)) * spread;
        const pos = polar(catPos.x, catPos.y, SKILL_R, sa);
        return { skill, pos, angle: sa };
      });

      return { cat, angle, catPos, skills };
    });
  }, [categories, total, cx, cy]);

  /* ── cubic bezier path between two points ── */
  const curvePath = (x1: number, y1: number, x2: number, y2: number) => {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  };

  return (
    <div className="relative w-full select-none">
      {/* ── controls ── */}
      <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
        <button
          onClick={expandAll}
          className="rounded-full border border-line bg-white/5 px-4 py-1.5 font-body text-xs text-fog backdrop-blur-sm transition-colors hover:border-fog hover:text-paper"
        >
          Expand All
        </button>
        <button
          onClick={collapseAll}
          className="rounded-full border border-line bg-white/5 px-4 py-1.5 font-body text-xs text-fog backdrop-blur-sm transition-colors hover:border-fog hover:text-paper"
        >
          Collapse All
        </button>
      </div>

      {/* ── hint ── */}
      {!rootExpanded && (
        <p className="mb-4 text-center font-body text-xs text-fog/60 animate-pulse">
          Click the center node to begin
        </p>
      )}

      {/* ── SVG canvas ── */}
      <div className="relative mx-auto w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm"
           style={{ maxWidth: W, aspectRatio: `${W}/${H}` }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="h-full w-full"
          aria-label="Frontend Skills Mind Map"
        >
          <defs>
            {/* Radial glow for root */}
            <radialGradient id="rootGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#c9a24b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#c9a24b" stopOpacity="0" />
            </radialGradient>
            {/* Category glows */}
            {categories.map((cat) => (
              <radialGradient key={cat.id} id={`grad-${cat.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={cat.color} stopOpacity="0.2" />
                <stop offset="100%" stopColor={cat.color} stopOpacity="0" />
              </radialGradient>
            ))}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* ── connecting lines: root → category ── */}
          {layout.map(({ cat, catPos }) => (
            <path
              key={`line-root-${cat.id}`}
              d={curvePath(cx, cy, catPos.x, catPos.y)}
              fill="none"
              stroke={cat.color}
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity={rootExpanded ? 0.5 : 0}
              style={{ transition: "opacity 0.5s ease, stroke-dashoffset 0.6s ease" }}
            />
          ))}

          {/* ── connecting lines: category → skill ── */}
          {layout.map(({ cat, catPos, skills }) =>
            skills.map(({ skill, pos }) => (
              <path
                key={`line-${cat.id}-${skill.id}`}
                d={curvePath(catPos.x, catPos.y, pos.x, pos.y)}
                fill="none"
                stroke={cat.color}
                strokeWidth="1"
                strokeLinecap="round"
                opacity={expandedCats.has(cat.id) ? 0.35 : 0}
                style={{ transition: "opacity 0.4s ease" }}
              />
            ))
          )}

          {/* ── root glow halo ── */}
          <circle cx={cx} cy={cy} r={ROOT_R + 30} fill="url(#rootGrad)"
            opacity={rootExpanded ? 1 : 0.4}
            style={{ transition: "opacity 0.5s" }}
          />

          {/* ── skill nodes ── */}
          {layout.map(({ cat, catPos, skills }) =>
            skills.map(({ skill, pos }) => {
              const isHovered = hoveredSkill === skill.id;
              const isVisible = expandedCats.has(cat.id);
              return (
                <g
                  key={skill.id}
                  transform={`translate(${pos.x},${pos.y})`}
                  style={{
                    opacity:    isVisible ? 1 : 0,
                    transform:  `translate(${isVisible ? pos.x : catPos.x}px, ${isVisible ? pos.y : catPos.y}px)`,
                    transition: "opacity 0.35s ease, transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                  onMouseEnter={(e) => handleSkillEnter(e, skill)}
                  onMouseLeave={handleSkillLeave}
                  className="cursor-default"
                >
                  {/* glow */}
                  <circle r={isHovered ? 34 : 28} fill={cat.color} opacity={isHovered ? 0.15 : 0.07}
                    style={{ transition: "r 0.2s, opacity 0.2s" }} />
                  {/* card bg */}
                  <rect x={-38} y={-18} width={76} height={36} rx={10}
                    fill="rgba(255,255,255,0.04)"
                    stroke={isHovered ? cat.color : "rgba(255,255,255,0.12)"}
                    strokeWidth={isHovered ? 1.5 : 1}
                    style={{ transition: "stroke 0.2s, stroke-width 0.2s" }}
                  />
                  {/* icon */}
                  <text x={-24} y={5} fontSize={12} textAnchor="middle" dominantBaseline="middle">{skill.icon}</text>
                  {/* label */}
                  <text
                    x={6} y={0}
                    fontSize={9.5}
                    fill={isHovered ? "#ededea" : "#7a7a76"}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily="var(--font-body)"
                    style={{ transition: "fill 0.2s" }}
                  >
                    {skill.label.length > 12 ? skill.label.slice(0, 11) + "…" : skill.label}
                  </text>
                </g>
              );
            })
          )}

          {/* ── category nodes ── */}
          {layout.map(({ cat, catPos }) => {
            const isExpanded = expandedCats.has(cat.id);
            const isActive   = activeCat === cat.id;
            const isVisible  = rootExpanded;
            return (
              <g
                key={cat.id}
                style={{
                  opacity:   isVisible ? 1 : 0,
                  transform: `translate(${isVisible ? catPos.x : cx}px, ${isVisible ? catPos.y : cy}px)`,
                  transition: "opacity 0.4s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
                  cursor: "pointer",
                }}
                onClick={() => toggleCat(cat.id)}
                role="button"
                aria-expanded={isExpanded}
                aria-label={`${cat.label} — click to ${isExpanded ? "collapse" : "expand"}`}
              >
                {/* glow halo */}
                <circle r={isExpanded ? 52 : 44} fill={`url(#grad-${cat.id})`}
                  style={{ transition: "r 0.3s" }} />
                {/* card */}
                <rect x={-52} y={-24} width={104} height={48} rx={14}
                  fill="rgba(10,10,10,0.75)"
                  stroke={isActive ? cat.color : "rgba(255,255,255,0.14)"}
                  strokeWidth={isActive ? 2 : 1}
                  filter={isActive ? "url(#glow)" : undefined}
                  style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
                />
                {/* icon */}
                <text x={-30} y={1} fontSize={14} textAnchor="middle" dominantBaseline="middle">{cat.icon}</text>
                {/* label — wrap into two lines if needed */}
                {cat.label.split(" ").length <= 2 ? (
                  <text x={10} y={0} fontSize={10} fill={isActive ? cat.color : "#ededea"}
                    textAnchor="middle" dominantBaseline="middle"
                    fontFamily="var(--font-body)" fontWeight="500"
                    style={{ transition: "fill 0.3s" }}>
                    {cat.label}
                  </text>
                ) : (
                  <>
                    <text x={10} y={-7} fontSize={9.5} fill={isActive ? cat.color : "#ededea"}
                      textAnchor="middle" dominantBaseline="middle"
                      fontFamily="var(--font-body)" fontWeight="500"
                      style={{ transition: "fill 0.3s" }}>
                      {cat.label.split(" ").slice(0, 2).join(" ")}
                    </text>
                    <text x={10} y={7} fontSize={9.5} fill={isActive ? cat.color : "#ededea"}
                      textAnchor="middle" dominantBaseline="middle"
                      fontFamily="var(--font-body)" fontWeight="500"
                      style={{ transition: "fill 0.3s" }}>
                      {cat.label.split(" ").slice(2).join(" ")}
                    </text>
                  </>
                )}
                {/* expand indicator */}
                <text x={42} y={0} fontSize={9} fill={cat.color} textAnchor="middle" dominantBaseline="middle"
                  opacity={0.8} style={{ transition: "opacity 0.2s" }}>
                  {isExpanded ? "−" : "+"}
                </text>
              </g>
            );
          })}

          {/* ── root node ── */}
          <g
            onClick={toggleRoot}
            style={{ cursor: "pointer" }}
            role="button"
            aria-expanded={rootExpanded}
            aria-label="Frontend Development — click to expand or collapse"
          >
            {/* outer ring pulse */}
            <circle cx={cx} cy={cy} r={ROOT_R + 14}
              fill="none"
              stroke="#c9a24b"
              strokeWidth="1"
              opacity={rootExpanded ? 0.4 : 0.2}
              style={{ transition: "opacity 0.4s" }}
            />
            {/* bg */}
            <circle cx={cx} cy={cy} r={ROOT_R}
              fill="rgba(10,10,10,0.9)"
              stroke="#c9a24b"
              strokeWidth={rootExpanded ? 2.5 : 1.5}
              filter="url(#glow)"
              style={{ transition: "stroke-width 0.3s" }}
            />
            {/* label */}
            <text x={cx} y={cy - 10} fontSize={11} fill="#c9a24b"
              textAnchor="middle" dominantBaseline="middle"
              fontFamily="var(--font-display)" fontStyle="italic" fontWeight="600">
              FRONTEND
            </text>
            <text x={cx} y={cy + 10} fontSize={11} fill="#c9a24b"
              textAnchor="middle" dominantBaseline="middle"
              fontFamily="var(--font-display)" fontStyle="italic" fontWeight="600">
              DEV
            </text>
            {/* click hint dot */}
            <circle cx={cx} cy={cy + ROOT_R - 10} r={3}
              fill="#c9a24b" opacity={rootExpanded ? 0 : 0.7}
              style={{ transition: "opacity 0.4s" }}
            />
          </g>
        </svg>

        {/* ── tooltip ── */}
        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg border border-white/10 bg-ink/90 px-3 py-1.5 font-body text-xs text-paper shadow-xl backdrop-blur-md"
            style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
          >
            {tooltip.text}
          </div>
        )}
      </div>

      {/* ── mobile legend (below map) ── */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:hidden">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { if (!rootExpanded) setRootExpanded(true); toggleCat(cat.id); }}
            className="flex items-center gap-2 rounded-xl border border-line bg-white/[0.03] px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
            style={{ borderColor: expandedCats.has(cat.id) ? cat.color : undefined }}
          >
            <span className="text-base">{cat.icon}</span>
            <span className="font-body text-xs leading-tight text-fog">{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
