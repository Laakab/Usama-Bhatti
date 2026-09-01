"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
  type PointerEvent as ReactPointerEvent,
} from "react";

/* ══════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════ */

interface Tool {
  id: string;
  label: string;
  icon: string;
  tooltip: string;
}

interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
  glow: string;
  tools: Tool[];
}

interface AiMapData {
  root: { label: string; subtitle: string; icon: string };
  categories: Category[];
}

const AI_MAP_DATA: AiMapData = {
  root: {
    label: "AI TOOLS",
    subtitle: "AI-Powered Development\n& Productivity",
    icon: "🤖",
  },
  categories: [
    {
      id: "editors",
      label: "AI Code Editors &\nDevelopment Tools",
      icon: "💻",
      color: "#60a5fa",
      glow: "rgba(96,165,250,0.35)",
      tools: [
        { id: "cursor",  label: "Cursor",           icon: "◎", tooltip: "AI-first code editor built for pair programming with LLMs." },
        { id: "kiro",    label: "Kiro",             icon: "🔺", tooltip: "AWS-integrated AI development environment by Amazon." },
        { id: "vscode",  label: "VS Code",          icon: "🔷", tooltip: "Microsoft's extensible code editor with AI extensions." },
        { id: "windsurf",label: "Windsurf",         icon: "🌊", tooltip: "Codeium's AI-powered code editor with flow state UX." },
        { id: "trae",    label: "Trae",             icon: "⚡", tooltip: "ByteDance's AI-native coding assistant and IDE." },
      ],
    },
    {
      id: "llms",
      label: "AI Assistants &\nLarge Language Models",
      icon: "🤖",
      color: "#a78bfa",
      glow: "rgba(167,139,250,0.35)",
      tools: [
        { id: "chatgpt",  label: "ChatGPT",  icon: "✦",  tooltip: "OpenAI's flagship conversational AI assistant." },
        { id: "claude",   label: "Claude",   icon: "◈",  tooltip: "Anthropic's safety-focused large language model." },
        { id: "gemini",   label: "Gemini",   icon: "♊",  tooltip: "Google DeepMind's multimodal AI assistant." },
        { id: "deepseek", label: "DeepSeek", icon: "🔍", tooltip: "High-performance open-source reasoning model." },
      ],
    },
    {
      id: "platforms",
      label: "AI Online\nDevelopment Platforms",
      icon: "🌐",
      color: "#34d399",
      glow: "rgba(52,211,153,0.35)",
      tools: [
        { id: "replit",   label: "Replit",   icon: "🔁", tooltip: "Browser-based collaborative coding with AI features." },
        { id: "emergent", label: "Emergent", icon: "🌱", tooltip: "AI-powered full-stack app generation platform." },
        { id: "lovable",  label: "Lovable",  icon: "💖", tooltip: "Generate production-ready React apps from prompts." },
        { id: "base44",   label: "Base44",   icon: "🔢", tooltip: "AI-native platform for rapid web application creation." },
      ],
    },
    {
      id: "creative",
      label: "AI Creative &\nGenerative Platforms",
      icon: "🎨",
      color: "#fb923c",
      glow: "rgba(251,146,60,0.35)",
      tools: [
        { id: "gflow",    label: "Google Flow",      icon: "🌊", tooltip: "Google's AI-powered creative workflow platform." },
        { id: "gaistudio",label: "Google AI Studio", icon: "🔬", tooltip: "Build & experiment with Gemini models directly." },
      ],
    },
  ],
};

/* ══════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════ */

interface Rect { x: number; y: number; w: number; h: number }

/* ══════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════ */

export default function AiToolsMindMap({ data = AI_MAP_DATA }: { data?: AiMapData }) {
  const [rootOpen,   setRootOpen]   = useState(false);
  const [openCats,   setOpenCats]   = useState<Set<string>>(new Set());
  const [hoveredTool,setHoveredTool]= useState<string | null>(null);
  const [tooltip,    setTooltip]    = useState<{ x: number; y: number; text: string } | null>(null);

  /* pan / zoom */
  const [zoom,   setZoom]  = useState(1);
  const [pan,    setPan]   = useState({ x: 0, y: 0 });
  const dragging           = useRef(false);
  const lastPos            = useRef({ x: 0, y: 0 });
  const wrapRef            = useRef<HTMLDivElement>(null);
  const canvasRef          = useRef<HTMLDivElement>(null);

  /* node rects for SVG lines */
  const [rects, setRects]  = useState<Record<string, Rect>>({});
  const nodeRefs           = useRef<Record<string, HTMLDivElement | null>>({});
  const [tick, setTick]    = useState(0); // bump to re-measure

  const { categories }     = data;

  /* ── measure all visible node positions relative to canvas ── */
  const measure = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const base = canvas.getBoundingClientRect();
    const next: Record<string, Rect> = {};
    Object.entries(nodeRefs.current).forEach(([id, el]) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      next[id] = {
        x: r.left - base.left,
        y: r.top  - base.top,
        w: r.width,
        h: r.height,
      };
    });
    setRects(next);
  }, []);

  useLayoutEffect(() => { measure(); }, [measure, tick, rootOpen, openCats, zoom, pan]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  /* ── re-measure after transitions finish ── */
  useEffect(() => {
    const t = setTimeout(() => setTick((v) => v + 1), 520);
    return () => clearTimeout(t);
  }, [rootOpen, openCats]);

  /* ── pan ── */
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-node]")) return;
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
    const el = wrapRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((z) => Math.min(Math.max(z - e.deltaY * 0.001, 0.3), 2.5));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  /* ── controls ── */
  const toggleCat = (id: string) =>
    setOpenCats((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleRoot = () =>
    setRootOpen((v) => { if (v) { setOpenCats(new Set()); } return !v; });

  const expandAll  = () => { setRootOpen(true);  setOpenCats(new Set(categories.map((c) => c.id))); };
  const collapseAll= () => { setRootOpen(false); setOpenCats(new Set()); };
  const resetView  = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
  const zoomIn     = () => setZoom((z) => Math.min(z + 0.15, 2.5));
  const zoomOut    = () => setZoom((z) => Math.max(z - 0.15, 0.3));

  /* ── SVG line helper: connect two rects edge-to-edge ── */
  const lineProps = (fromId: string, toId: string, color: string, visible: boolean) => {
    const f = rects[fromId];
    const t = rects[toId];
    if (!f || !t || !visible) return null;

    const fx = f.x + f.w / 2;
    const fy = f.y + f.h / 2;
    const tx = t.x + t.w / 2;
    const ty = t.y + t.h / 2;

    // find edge intersection
    const sx = fx < tx ? f.x + f.w : f.x;
    const sy = fy;
    const ex = tx < fx ? t.x + t.w : t.x;
    const ey = ty;

    const mx = (sx + ex) / 2;
    return `M${sx},${sy} C${mx},${sy} ${mx},${ey} ${ex},${ey}`;
  };

  /* ── canvas size: large enough for content ── */
  const CANVAS_W = 1400;
  const CANVAS_H = 900;

  /* ── category layout: circle around root ── */
  const catAngles = categories.map((_, i) => (i / categories.length) * 2 * Math.PI - Math.PI / 2);

  /* ── tool layout: fan out from category ── */
  const toolOffset = (catIdx: number, toolIdx: number, total: number) => {
    const baseAngle = catAngles[catIdx];
    const spread    = Math.min(Math.PI * 0.55, total * 0.32);
    const a         = total === 1 ? baseAngle : baseAngle - spread / 2 + (toolIdx / (total - 1)) * spread;
    const dist      = 190;
    return {
      x: CANVAS_W / 2 + Math.cos(a) * (220 + dist) - 54,
      y: CANVAS_H / 2 + Math.sin(a) * (220 + dist) - 18,
    };
  };

  const catPos = (i: number) => ({
    x: CANVAS_W / 2 + Math.cos(catAngles[i]) * 220 - 80,
    y: CANVAS_H / 2 + Math.sin(catAngles[i]) * 220 - 44,
  });

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <div className="relative w-full select-none" aria-label="AI Tools Mind Map">

      {/* ── Controls ── */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Expand All",   fn: expandAll },
            { label: "Collapse All", fn: collapseAll },
            { label: "Reset View",   fn: resetView },
          ].map(({ label, fn }) => (
            <button key={label} onClick={fn}
              className="rounded-full border border-line bg-white/5 px-4 py-1.5 font-body text-xs text-fog backdrop-blur-sm transition-colors hover:border-fog hover:text-paper">
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={zoomOut}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white/5 font-body text-base text-fog transition-colors hover:border-fog hover:text-paper">−</button>
          <span className="w-12 text-center font-body text-xs text-fog">{Math.round(zoom * 100)}%</span>
          <button onClick={zoomIn}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white/5 font-body text-base text-fog transition-colors hover:border-fog hover:text-paper">+</button>
        </div>
      </div>

      {!rootOpen && (
        <p className="mb-4 animate-pulse text-center font-body text-xs text-fog/50">
          Click the center node to begin · Drag to pan · Scroll to zoom
        </p>
      )}

      {/* ── Canvas wrapper ── */}
      <div
        ref={wrapRef}
        className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#050507] cursor-grab active:cursor-grabbing"
        style={{ height: 640 }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* inner canvas — panned & zoomed */}
        <div
          ref={canvasRef}
          style={{
            position: "absolute",
            width:  CANVAS_W,
            height: CANVAS_H,
            transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
            transformOrigin: "center center",
            left: "50%",
            top:  "50%",
            transition: dragging.current ? "none" : "transform 0.05s",
          }}
        >
          {/* ── SVG connection lines ── */}
          <svg
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", overflow: "visible" }}
          >
            {/* root → categories */}
            {categories.map((cat) => {
              const d = lineProps("root", cat.id, cat.color, rootOpen);
              return d ? (
                <path key={`r-${cat.id}`} d={d}
                  fill="none" stroke={cat.color} strokeWidth="1.5" strokeLinecap="round"
                  opacity={0.45}
                  style={{ transition: "opacity 0.4s" }}
                />
              ) : null;
            })}

            {/* categories → tools */}
            {categories.map((cat) =>
              cat.tools.map((tool) => {
                const d = lineProps(cat.id, tool.id, cat.color, openCats.has(cat.id));
                return d ? (
                  <path key={`t-${tool.id}`} d={d}
                    fill="none" stroke={cat.color} strokeWidth="1"
                    strokeLinecap="round"
                    opacity={hoveredTool === tool.id ? 0.9 : 0.3}
                    style={{ transition: "opacity 0.25s" }}
                  />
                ) : null;
              })
            )}
          </svg>

          {/* ── Root node ── */}
          <div
            ref={(el) => { nodeRefs.current["root"] = el; }}
            data-node
            onClick={toggleRoot}
            style={{
              position:  "absolute",
              left:      CANVAS_W / 2 - 90,
              top:       CANVAS_H / 2 - 64,
              zIndex:    30,
              cursor:    "pointer",
              transition: "box-shadow 0.3s",
              boxShadow: rootOpen
                ? "0 0 40px rgba(201,162,75,0.5), 0 0 0 1px rgba(201,162,75,0.6)"
                : "0 0 20px rgba(201,162,75,0.2), 0 0 0 1px rgba(201,162,75,0.3)",
            }}
            className="w-[180px] rounded-2xl bg-[#0d0d0f] p-5 text-center"
            role="button"
            aria-expanded={rootOpen}
          >
            <div className="mb-1 text-3xl">{data.root.icon}</div>
            <div className="font-display text-sm font-bold italic leading-tight text-[#c9a24b]">
              {data.root.label}
            </div>
            <div className="mt-1.5 font-body text-[10px] leading-snug text-fog/70 whitespace-pre-line">
              {data.root.subtitle}
            </div>
            <div className="mt-2 font-body text-[9px] text-[#c9a24b]/60">
              {rootOpen ? "click to collapse" : "click to expand"}
            </div>
          </div>

          {/* ── Category nodes ── */}
          {categories.map((cat, ci) => {
            const pos       = catPos(ci);
            const isOpen    = openCats.has(cat.id);
            const isVisible = rootOpen;

            return (
              <div
                key={cat.id}
                ref={(el) => { nodeRefs.current[cat.id] = el; }}
                data-node
                onClick={() => isVisible && toggleCat(cat.id)}
                style={{
                  position:   "absolute",
                  left:       pos.x,
                  top:        pos.y,
                  zIndex:     20,
                  opacity:    isVisible ? 1 : 0,
                  transform:  isVisible ? "scale(1)" : "scale(0.6)",
                  transition: "opacity 0.45s cubic-bezier(0.34,1.4,0.64,1), transform 0.45s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.3s",
                  cursor:     isVisible ? "pointer" : "default",
                  pointerEvents: isVisible ? "auto" : "none",
                  boxShadow:  isOpen
                    ? `0 0 28px ${cat.glow}, 0 0 0 1.5px ${cat.color}80`
                    : `0 0 12px ${cat.glow.replace("0.35", "0.15")}, 0 0 0 1px rgba(255,255,255,0.1)`,
                  width: 160,
                }}
                className="rounded-xl bg-[#0d0d0f] p-4 text-center"
                role="button"
                aria-expanded={isOpen}
              >
                <div className="mb-1.5 text-2xl">{cat.icon}</div>
                <div
                  className="font-body text-[10px] font-semibold leading-snug whitespace-pre-line"
                  style={{ color: isOpen ? cat.color : "#ededea" }}
                >
                  {cat.label}
                </div>
                <div className="mt-2 font-body text-[9px] text-fog/60">
                  {cat.tools.length} tools
                </div>
                <div
                  className="mt-1.5 font-body text-[9px]"
                  style={{ color: cat.color, opacity: 0.8 }}
                >
                  {isOpen ? "−" : "+"}
                </div>
              </div>
            );
          })}

          {/* ── Tool nodes ── */}
          {categories.map((cat, ci) =>
            cat.tools.map((tool, ti) => {
              const off        = toolOffset(ci, ti, cat.tools.length);
              const isVisible  = openCats.has(cat.id);
              const catCtr     = catPos(ci);
              const isHovered  = hoveredTool === tool.id;

              return (
                <div
                  key={tool.id}
                  ref={(el) => { nodeRefs.current[tool.id] = el; }}
                  data-node
                  style={{
                    position:   "absolute",
                    left:       off.x,
                    top:        off.y,
                    zIndex:     10,
                    width:      108,
                    opacity:    isVisible ? 1 : 0,
                    transform:  isVisible
                      ? `scale(${isHovered ? 1.08 : 1})`
                      : `translate(${catCtr.x + 80 - off.x}px, ${catCtr.y + 44 - off.y}px) scale(0.5)`,
                    transition: "opacity 0.35s cubic-bezier(0.34,1.4,0.64,1), transform 0.4s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.2s",
                    pointerEvents: isVisible ? "auto" : "none",
                    cursor:    isVisible ? "default" : "default",
                    boxShadow: isHovered
                      ? `0 0 20px ${cat.glow}, 0 0 0 1.5px ${cat.color}90`
                      : "0 0 0 1px rgba(255,255,255,0.08)",
                  }}
                  className="rounded-xl bg-[#0d0d0f] px-3 py-2.5 text-center"
                  onMouseEnter={(e) => {
                    setHoveredTool(tool.id);
                    const rect = wrapRef.current?.getBoundingClientRect();
                    if (rect) setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top - 10, text: tool.tooltip });
                  }}
                  onMouseLeave={() => { setHoveredTool(null); setTooltip(null); }}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-sm" style={{ color: cat.color }}>{tool.icon}</span>
                    <span
                      className="font-body text-[10px] font-medium leading-tight"
                      style={{ color: isHovered ? "#ededea" : "#a0a09e" }}
                    >
                      {tool.label}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Tooltip ── */}
        {tooltip && (
          <div
            className="pointer-events-none absolute z-50 max-w-[200px] rounded-xl border border-white/10 bg-[#0d0d0f]/95 px-3 py-2 font-body text-xs leading-snug text-paper shadow-2xl backdrop-blur-md"
            style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%,-100%)" }}
          >
            {tooltip.text}
          </div>
        )}
      </div>

      {/* ══ MOBILE TREE (< lg) ══ */}
      <div className="mt-10 lg:hidden">
        <p className="mb-4 text-center font-body text-xs text-fog/50">Tap to explore</p>
        <MobileTree data={data} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MOBILE TREE
══════════════════════════════════════════════════════════════ */

function MobileTree({ data }: { data: AiMapData }) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setOpen((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="mx-auto max-w-lg">
      {/* root */}
      <div className="mb-4 rounded-2xl border border-[#c9a24b]/40 bg-[#0d0d0f] p-5 text-center">
        <div className="text-3xl">{data.root.icon}</div>
        <div className="mt-1 font-display text-base font-bold italic text-[#c9a24b]">{data.root.label}</div>
        <div className="mt-1 font-body text-xs text-fog/60 whitespace-pre-line">{data.root.subtitle}</div>
      </div>

      <div className="flex flex-col gap-3">
        {data.categories.map((cat) => (
          <div key={cat.id} className="overflow-hidden rounded-xl border border-white/10"
            style={{ borderColor: open.has(cat.id) ? `${cat.color}50` : undefined }}>
            <button
              onClick={() => toggle(cat.id)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
              aria-expanded={open.has(cat.id)}
            >
              <span className="text-xl">{cat.icon}</span>
              <div className="flex-1">
                <div className="font-body text-sm font-semibold text-paper whitespace-pre-line leading-tight">
                  {cat.label.replace("\n", " ")}
                </div>
                <div className="font-body text-xs text-fog/50">{cat.tools.length} tools</div>
              </div>
              <span className="font-body text-sm" style={{ color: cat.color }}>
                {open.has(cat.id) ? "−" : "+"}
              </span>
            </button>

            {open.has(cat.id) && (
              <div className="border-t border-white/5 px-4 pb-4 pt-3">
                <div className="flex flex-wrap gap-2">
                  {cat.tools.map((tool) => (
                    <div key={tool.id} title={tool.tooltip}
                      className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/[0.04] px-3 py-1.5">
                      <span className="text-sm" style={{ color: cat.color }}>{tool.icon}</span>
                      <span className="font-body text-xs text-fog">{tool.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
