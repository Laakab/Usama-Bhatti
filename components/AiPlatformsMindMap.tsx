"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  type PointerEvent as ReactPointerEvent,
} from "react";

/* ══════════════════════════════════════════
   DATA  (keep separate from UI)
══════════════════════════════════════════ */

export interface AiTool {
  id: string;
  label: string;
  icon: string;
  tooltip: string;
}

export interface AiCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
  glow: string;
  tools: AiTool[];
}

export interface AiPlatformsData {
  root: string;
  accent: string;
  categories: AiCategory[];
}

export const AI_PLATFORMS_DATA: AiPlatformsData = {
  root: "🤖 AI TOOLS\n& PLATFORMS",
  accent: "#a78bfa",
  categories: [
    {
      id: "coding",
      label: "AI Coding &\nDevelopment Tools",
      icon: "💻",
      color: "#60a5fa",
      glow: "rgba(96,165,250,0.35)",
      tools: [
        {
          id: "cursor",
          label: "Cursor",
          icon: "◎",
          tooltip: "AI-first code editor with deep LLM integration for writing & refactoring.",
        },
        {
          id: "replit",
          label: "Replit",
          icon: "🔁",
          tooltip: "Browser-based collaborative IDE with built-in AI coding assistant.",
        },
        {
          id: "kiro",
          label: "Kiro",
          icon: "🔺",
          tooltip: "AWS-integrated AI development environment by Amazon.",
        },
        {
          id: "vscode",
          label: "VS Code",
          icon: "🔷",
          tooltip: "Microsoft's extensible editor powering GitHub Copilot and AI extensions.",
        },
        {
          id: "windsurf",
          label: "Windsurf",
          icon: "🌊",
          tooltip: "Codeium's AI-native editor designed for flow-state development.",
        },
        {
          id: "trae",
          label: "Trae",
          icon: "⚡",
          tooltip: "ByteDance's AI-native coding assistant and IDE.",
        },
      ],
    },
    {
      id: "assistants",
      label: "AI Assistants &\nLarge Language Models",
      icon: "🧠",
      color: "#a78bfa",
      glow: "rgba(167,139,250,0.35)",
      tools: [
        {
          id: "gemini",
          label: "Gemini",
          icon: "♊",
          tooltip: "Google DeepMind's multimodal AI assistant integrated across Google Workspace.",
        },
        {
          id: "deepseek",
          label: "DeepSeek",
          icon: "🔍",
          tooltip: "High-performance open-source reasoning model with strong coding ability.",
        },
        {
          id: "chatgpt",
          label: "ChatGPT",
          icon: "✦",
          tooltip: "OpenAI's flagship conversational AI for ideation, writing and debugging.",
        },
        {
          id: "claude",
          label: "Claude",
          icon: "◈",
          tooltip: "Anthropic's safety-focused LLM with excellent long-context understanding.",
        },
      ],
    },
    {
      id: "platforms",
      label: "AI Online\nDevelopment Platforms",
      icon: "🌐",
      color: "#34d399",
      glow: "rgba(52,211,153,0.35)",
      tools: [
        {
          id: "emergent",
          label: "Emergent",
          icon: "🌱",
          tooltip: "AI-powered full-stack app generation from natural language prompts.",
        },
        {
          id: "lovable",
          label: "Lovable",
          icon: "💖",
          tooltip: "Generate production-ready React apps with AI from a browser.",
        },
        {
          id: "base44",
          label: "Base44",
          icon: "🔢",
          tooltip: "AI-native platform for rapid web application creation.",
        },
        {
          id: "gflow",
          label: "Google Flow",
          icon: "🌊",
          tooltip: "Google's AI-powered creative workflow and ideation platform.",
        },
        {
          id: "gaistudio",
          label: "Google AI Studio",
          icon: "🔬",
          tooltip: "Build and experiment with Gemini models through an interactive studio.",
        },
      ],
    },
  ],
};

/* ══════════════════════════════════════════
   GEOMETRY  (matches BackendMindMap exactly)
══════════════════════════════════════════ */

const W = 1100, H = 1100, CX = W / 2, CY = H / 2;
const ROOT_R = 72;
const CAT_R  = 240;   // root → category orbit — wider since only 3 cats
const LEAF_R = 115;   // category → tool leaf

function polar(ox: number, oy: number, r: number, a: number) {
  return { x: ox + r * Math.cos(a), y: oy + r * Math.sin(a) };
}

function angleFor(i: number, total: number, offset = -Math.PI / 2) {
  return offset + (i / total) * 2 * Math.PI;
}

function qBez(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
}

/* ══════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════ */

export default function AiPlatformsMindMap({
  data = AI_PLATFORMS_DATA,
}: {
  data?: AiPlatformsData;
}) {
  /* state */
  const [rootOpen,   setRootOpen]   = useState(false);
  const [openCats,   setOpenCats]   = useState<Set<string>>(new Set());
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [tip, setTip]               = useState<{ x: number; y: number; text: string } | null>(null);

  /* pan / zoom */
  const [zoom,  setZoom] = useState(1);
  const [pan,   setPan]  = useState({ x: 0, y: 0 });
  const dragging         = useRef(false);
  const lastPos          = useRef({ x: 0, y: 0 });
  const containerRef     = useRef<HTMLDivElement>(null);
  const svgRef           = useRef<SVGSVGElement>(null);

  const { categories, accent } = data;

  /* ── toggles ── */
  const toggleRoot = () =>
    setRootOpen((v) => {
      if (v) { setOpenCats(new Set()); setActiveTool(null); }
      return !v;
    });

  const toggleCat = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenCats((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  const expandAll   = () => { setRootOpen(true);  setOpenCats(new Set(categories.map((c) => c.id))); };
  const collapseAll = () => { setRootOpen(false); setOpenCats(new Set()); setActiveTool(null); };
  const resetView   = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
  const zoomIn      = () => setZoom((z) => Math.min(z + 0.2, 3));
  const zoomOut     = () => setZoom((z) => Math.max(z - 0.2, 0.3));

  /* ── pan ── */
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    lastPos.current  = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    setPan((p) => ({
      x: p.x + e.clientX - lastPos.current.x,
      y: p.y + e.clientY - lastPos.current.y,
    }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = () => { dragging.current = false; };

  /* ── wheel zoom ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((z) => Math.min(Math.max(z - e.deltaY * 0.001, 0.3), 3));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  /* ── tooltip ── */
  const showTip = useCallback((e: React.MouseEvent<SVGGElement>, text: string) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTip({ x: e.clientX - rect.left, y: e.clientY - rect.top - 14, text });
  }, []);
  const hideTip = useCallback(() => setTip(null), []);

  /* ── layout ── */
  const layout = useMemo(() => {
    const total = categories.length;
    return categories.map((cat, ci) => {
      const catAngle = angleFor(ci, total);
      const catPos   = polar(CX, CY, CAT_R, catAngle);

      /* fan tools around the category */
      const toolLayout = cat.tools.map((tool, ti, arr) => {
        const spread = Math.min(Math.PI * 0.72, arr.length * 0.36);
        const ta = arr.length === 1
          ? catAngle
          : catAngle - spread / 2 + (ti / (arr.length - 1)) * spread;
        return { tool, pos: polar(catPos.x, catPos.y, LEAF_R, ta) };
      });

      return { cat, catAngle, catPos, toolLayout };
    });
  }, [categories]);

  /* ── SVG label helper: wraps long text to 2 lines ── */
  const renderLabel = (
    text: string,
    x: number,
    y: number,
    fill: string,
    size: number,
    bold = false,
  ) => {
    const words = text.replace("\n", " ").split(" ");
    if (words.length <= 2) {
      return (
        <text x={x} y={y} fontSize={size} fill={fill}
          textAnchor="middle" dominantBaseline="middle"
          fontFamily="var(--font-body)" fontWeight={bold ? "600" : "400"}>
          {words.join(" ")}
        </text>
      );
    }
    const half  = Math.ceil(words.length / 2);
    const line1 = words.slice(0, half).join(" ");
    const line2 = words.slice(half).join(" ");
    const gap   = size * 0.75;
    return (
      <>
        <text x={x} y={y - gap} fontSize={size} fill={fill}
          textAnchor="middle" dominantBaseline="middle"
          fontFamily="var(--font-body)" fontWeight={bold ? "600" : "400"}>
          {line1}
        </text>
        <text x={x} y={y + gap} fontSize={size} fill={fill}
          textAnchor="middle" dominantBaseline="middle"
          fontFamily="var(--font-body)" fontWeight={bold ? "600" : "400"}>
          {line2}
        </text>
      </>
    );
  };

  /* ── tool (leaf) node renderer ── */
  const renderTool = (
    tool: AiTool,
    pos: { x: number; y: number },
    fromPos: { x: number; y: number },
    color: string,
    visible: boolean,
  ) => {
    const active = activeTool === tool.id;
    return (
      <g key={tool.id}>
        {/* connecting line */}
        <path
          d={qBez(fromPos.x, fromPos.y, pos.x, pos.y)}
          fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round"
          opacity={visible ? (active ? 0.7 : 0.3) : 0}
          style={{ transition: "opacity 0.3s" }}
        />
        {/* node group — CSS transform for enter/exit */}
        <g
          style={{
            opacity:    visible ? 1 : 0,
            transform:  `translate(${visible ? pos.x : fromPos.x}px, ${visible ? pos.y : fromPos.y}px)`,
            transition: "opacity 0.3s ease, transform 0.42s cubic-bezier(0.34,1.4,0.64,1)",
            cursor:     "default",
          }}
          onMouseEnter={(e) => { showTip(e, tool.tooltip); setActiveTool(tool.id); }}
          onMouseLeave={() => { hideTip(); setActiveTool(null); }}
        >
          {/* glow halo */}
          <circle r={active ? 36 : 28} fill={color}
            opacity={active ? 0.18 : 0.07}
            style={{ transition: "r 0.2s, opacity 0.2s" }}
          />
          {/* card */}
          <rect x={-40} y={-18} width={80} height={36} rx={10}
            fill="rgba(8,8,8,0.88)"
            stroke={active ? color : "rgba(255,255,255,0.1)"}
            strokeWidth={active ? 1.5 : 0.8}
            style={{ transition: "stroke 0.2s, stroke-width 0.2s" }}
          />
          {/* icon */}
          <text x={-22} y={0} fontSize={12}
            textAnchor="middle" dominantBaseline="middle">
            {tool.icon}
          </text>
          {/* label */}
          <text
            x={10} y={0} fontSize={8.5}
            fill={active ? "#ededea" : "#7a7a76"}
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="var(--font-body)"
            style={{ transition: "fill 0.2s" }}
          >
            {tool.label.length > 12 ? tool.label.slice(0, 11) + "…" : tool.label}
          </text>
        </g>
      </g>
    );
  };

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="relative w-full select-none" aria-label="AI Tools & Platforms Mind Map">

      {/* ── Controls ── */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Expand All",   fn: expandAll   },
            { label: "Collapse All", fn: collapseAll },
            { label: "Reset View",   fn: resetView   },
          ].map(({ label, fn }) => (
            <button key={label} onClick={fn}
              className="rounded-full border border-line bg-white/5 px-4 py-1.5 font-body text-xs text-fog backdrop-blur-sm transition-colors hover:border-fog hover:text-paper">
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={zoomOut}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white/5 font-body text-sm text-fog transition-colors hover:border-fog hover:text-paper">
            −
          </button>
          <span className="w-12 text-center font-body text-xs text-fog">
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={zoomIn}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white/5 font-body text-sm text-fog transition-colors hover:border-fog hover:text-paper">
            +
          </button>
        </div>
      </div>

      {!rootOpen && (
        <p className="mb-4 animate-pulse text-center font-body text-xs text-fog/60">
          Click the center node to begin · Drag to pan · Scroll to zoom
        </p>
      )}

      {/* ── SVG canvas ── */}
      <div
        ref={containerRef}
        className="relative mx-auto w-full cursor-grab overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm active:cursor-grabbing"
        style={{ maxWidth: W, aspectRatio: `${W}/${H}` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className="h-full w-full"
          style={{
            transform:       `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
            transformOrigin: "center",
            transition:      dragging.current ? "none" : "transform 0.08s",
          }}
        >
          <defs>
            {/* root radial glow */}
            <radialGradient id="ai-root-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={accent} stopOpacity="0.28" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </radialGradient>
            {/* per-category glows */}
            {categories.map((c) => (
              <radialGradient key={c.id} id={`ai-grad-${c.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={c.color} stopOpacity="0.22" />
                <stop offset="100%" stopColor={c.color} stopOpacity="0" />
              </radialGradient>
            ))}
            {/* glow filter */}
            <filter id="ai-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ══ ROOT → CATEGORY LINES ══ */}
          {layout.map(({ cat, catPos }) => (
            <path
              key={`rl-${cat.id}`}
              d={qBez(CX, CY, catPos.x, catPos.y)}
              fill="none" stroke={cat.color} strokeWidth="1.5" strokeLinecap="round"
              opacity={rootOpen ? 0.45 : 0}
              style={{ transition: "opacity 0.5s ease" }}
            />
          ))}

          {/* ══ CATEGORIES + TOOLS ══ */}
          {layout.map(({ cat, catPos, toolLayout }) => {
            const catOpen = openCats.has(cat.id);
            const catVis  = rootOpen;

            return (
              <g key={cat.id}>
                {/* category → tool lines */}
                {toolLayout.map(({ tool, pos }) => (
                  <path
                    key={`tl-${tool.id}`}
                    d={qBez(catPos.x, catPos.y, pos.x, pos.y)}
                    fill="none" stroke={cat.color} strokeWidth="0.8" strokeLinecap="round"
                    opacity={catOpen ? (activeTool === tool.id ? 0.7 : 0.3) : 0}
                    style={{ transition: "opacity 0.35s ease" }}
                  />
                ))}

                {/* tool nodes */}
                {toolLayout.map(({ tool, pos }) =>
                  renderTool(tool, pos, catPos, cat.color, catOpen)
                )}

                {/* ── CATEGORY NODE ── */}
                <g
                  style={{
                    opacity:   catVis ? 1 : 0,
                    transform: `translate(${catVis ? catPos.x : CX}px,${catVis ? catPos.y : CY}px)`,
                    transition: "opacity 0.45s ease, transform 0.55s cubic-bezier(0.34,1.4,0.64,1)",
                    cursor: "pointer",
                  }}
                  onClick={(e) => toggleCat(cat.id, e)}
                  role="button"
                  aria-expanded={catOpen}
                  aria-label={`${cat.label} — ${catOpen ? "collapse" : "expand"}`}
                >
                  {/* halo */}
                  <circle r={catOpen ? 62 : 52} fill={`url(#ai-grad-${cat.id})`}
                    style={{ transition: "r 0.3s" }} />
                  {/* card */}
                  <rect x={-60} y={-28} width={120} height={56} rx={15}
                    fill="rgba(8,8,8,0.90)"
                    stroke={catOpen ? cat.color : "rgba(255,255,255,0.14)"}
                    strokeWidth={catOpen ? 2 : 1}
                    filter={catOpen ? "url(#ai-glow)" : undefined}
                    style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
                  />
                  {/* icon */}
                  <text x={-38} y={0} fontSize={16}
                    textAnchor="middle" dominantBaseline="middle">
                    {cat.icon}
                  </text>
                  {/* label (2-line wrap) */}
                  {renderLabel(
                    cat.label,
                    14,
                    0,
                    catOpen ? cat.color : "#ededea",
                    9.5,
                    true,
                  )}
                  {/* toggle indicator */}
                  <text x={50} y={0} fontSize={11}
                    fill={cat.color} textAnchor="middle" dominantBaseline="middle"
                    opacity={0.9}>
                    {catOpen ? "−" : "+"}
                  </text>
                </g>
              </g>
            );
          })}

          {/* ══ ROOT GLOW ══ */}
          <circle cx={CX} cy={CY} r={ROOT_R + 40} fill="url(#ai-root-grad)"
            opacity={rootOpen ? 1 : 0.45}
            style={{ transition: "opacity 0.5s" }}
          />

          {/* ══ ROOT NODE ══ */}
          <g
            onClick={toggleRoot}
            style={{ cursor: "pointer" }}
            role="button"
            aria-expanded={rootOpen}
            aria-label="AI Tools & Platforms — click to expand or collapse"
          >
            {/* outer pulse ring */}
            <circle cx={CX} cy={CY} r={ROOT_R + 18}
              fill="none" stroke={accent} strokeWidth="1"
              opacity={rootOpen ? 0.5 : 0.22}
              style={{ transition: "opacity 0.4s" }}
            />
            {/* inner ring */}
            <circle cx={CX} cy={CY} r={ROOT_R + 8}
              fill="none" stroke={accent} strokeWidth="0.5"
              opacity={rootOpen ? 0.25 : 0.1}
              style={{ transition: "opacity 0.4s" }}
            />
            {/* body */}
            <circle cx={CX} cy={CY} r={ROOT_R}
              fill="rgba(8,8,8,0.96)"
              stroke={accent}
              strokeWidth={rootOpen ? 2.5 : 1.5}
              filter="url(#ai-glow)"
              style={{ transition: "stroke-width 0.3s" }}
            />
            {/* multi-line label */}
            {data.root.split("\n").map((line, i, arr) => (
              <text
                key={i}
                x={CX}
                y={CY + (i - (arr.length - 1) / 2) * 15}
                fontSize={11}
                fill={accent}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="var(--font-display)"
                fontStyle="italic"
                fontWeight="700"
              >
                {line}
              </text>
            ))}
            {/* hint dot */}
            <circle cx={CX} cy={CY + ROOT_R - 12} r={3}
              fill={accent}
              opacity={rootOpen ? 0 : 0.7}
              style={{ transition: "opacity 0.4s" }}
            />
          </g>
        </svg>

        {/* ── Tooltip ── */}
        {tip && (
          <div
            className="pointer-events-none absolute z-20 max-w-[200px] rounded-xl border border-white/10 bg-ink/95 px-3 py-2 font-body text-xs leading-snug text-paper shadow-2xl backdrop-blur-md"
            style={{ left: tip.x, top: tip.y, transform: "translate(-50%,-100%)" }}
          >
            {tip.text}
          </div>
        )}
      </div>

      {/* ══ MOBILE ACCORDION  (hidden on lg+) ══ */}
      <div className="mt-10 lg:hidden">
        <p className="mb-4 font-body text-xs text-fog/60">Tap categories to explore</p>
        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <AiMobileAccordion key={cat.id} cat={cat} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MOBILE ACCORDION
══════════════════════════════════════════ */

function AiMobileAccordion({ cat }: { cat: AiCategory }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="overflow-hidden rounded-xl border border-line transition-colors"
      style={{ borderColor: open ? `${cat.color}55` : undefined }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
        aria-expanded={open}
      >
        <span className="text-xl">{cat.icon}</span>
        <div className="flex-1">
          <div className="font-body text-sm font-semibold leading-snug text-paper">
            {cat.label.replace("\n", " ")}
          </div>
          <div className="font-body text-xs text-fog/50">{cat.tools.length} tools</div>
        </div>
        <span className="text-sm" style={{ color: cat.color }}>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="border-t border-white/5 px-4 pb-4 pt-3">
          <div className="flex flex-wrap gap-2">
            {cat.tools.map((tool) => (
              <div
                key={tool.id}
                title={tool.tooltip}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
              >
                <span className="text-sm" style={{ color: cat.color }}>{tool.icon}</span>
                <div>
                  <div className="font-body text-xs font-medium text-paper">{tool.label}</div>
                  <div className="mt-0.5 max-w-[180px] font-body text-[10px] leading-snug text-fog/70">
                    {tool.tooltip}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
