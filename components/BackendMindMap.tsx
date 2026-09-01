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
   DATA
══════════════════════════════════════════ */

export interface LeafNode {
  id: string;
  label: string;
  icon: string;
  tooltip: string;
}

export interface SubGroup {
  id: string;
  label: string;
  icon: string;
  children: LeafNode[];
}

export interface CategoryNode {
  id: string;
  label: string;
  icon: string;
  color: string;
  glow: string;
  /** flat skills OR sub-groups — one or the other */
  skills?: LeafNode[];
  groups?: SubGroup[];
}

export interface BackendMapData {
  root: string;
  accent: string;
  categories: CategoryNode[];
}

export const BACKEND_MAP_DATA: BackendMapData = {
  root: "BACKEND\nDEVELOPMENT",
  accent: "#4ade80",
  categories: [
    {
      id: "langs",
      label: "Backend Languages",
      icon: "🖥️",
      color: "#facc15",
      glow: "rgba(250,204,21,0.3)",
      skills: [
        { id: "js-node",  label: "JavaScript",  icon: "🟨", tooltip: "Node.js runtime — async I/O" },
        { id: "ts",       label: "TypeScript",  icon: "🔷", tooltip: "Typed superset of JavaScript" },
        { id: "python",   label: "Python",      icon: "🐍", tooltip: "Versatile backend language" },
        { id: "cpp",      label: "C++",         icon: "⚙️", tooltip: "High-performance systems language" },
        { id: "php",      label: "PHP",         icon: "🐘", tooltip: "Server-side scripting language" },
      ],
    },
    {
      id: "frameworks",
      label: "Frameworks & Runtime",
      icon: "🚀",
      color: "#60a5fa",
      glow: "rgba(96,165,250,0.3)",
      groups: [
        {
          id: "nodejs-eco",
          label: "Node.js Ecosystem",
          icon: "🟩",
          children: [
            { id: "nodejs",   label: "Node.js",    icon: "🟩", tooltip: "JavaScript runtime on V8" },
            { id: "express",  label: "Express.js", icon: "🚂", tooltip: "Minimal Node.js web framework" },
            { id: "nestjs",   label: "NestJS",     icon: "🔺", tooltip: "Opinionated Node.js framework" },
          ],
        },
        {
          id: "python-fw",
          label: "Python",
          icon: "🐍",
          children: [
            { id: "django",     label: "Django",         icon: "🎸", tooltip: "Batteries-included Python framework" },
            { id: "drf",        label: "Django REST",    icon: "🔌", tooltip: "Toolkit for building REST APIs" },
            { id: "flask",      label: "Flask",          icon: "🧪", tooltip: "Lightweight WSGI framework" },
            { id: "fastapi",    label: "FastAPI",        icon: "⚡", tooltip: "High-perf async API framework" },
          ],
        },
        {
          id: "php-fw",
          label: "PHP",
          icon: "🐘",
          children: [
            { id: "laravel", label: "Laravel", icon: "🎯", tooltip: "Elegant PHP web framework" },
          ],
        },
      ],
    },
    {
      id: "databases",
      label: "Databases",
      icon: "🗄️",
      color: "#f97316",
      glow: "rgba(249,115,22,0.3)",
      groups: [
        {
          id: "sql",
          label: "SQL",
          icon: "📋",
          children: [
            { id: "mysql",   label: "MySQL",      icon: "🐬", tooltip: "Most popular open-source RDBMS" },
            { id: "psql",    label: "PostgreSQL", icon: "🐘", tooltip: "Advanced open-source RDBMS" },
            { id: "mssql",   label: "MSSQL",      icon: "🪟", tooltip: "Microsoft SQL Server" },
            { id: "sqlite",  label: "SQLite",     icon: "📁", tooltip: "Embedded relational database" },
          ],
        },
        {
          id: "nosql",
          label: "NoSQL",
          icon: "🍃",
          children: [
            { id: "mongo", label: "MongoDB", icon: "🍃", tooltip: "Document-oriented NoSQL database" },
          ],
        },
      ],
    },
    {
      id: "api-arch",
      label: "API & Architecture",
      icon: "🔌",
      color: "#a78bfa",
      glow: "rgba(167,139,250,0.3)",
      skills: [
        { id: "rest",    label: "REST API",    icon: "🔗", tooltip: "Representational state transfer" },
        { id: "graphql", label: "GraphQL",     icon: "◉",  tooltip: "Query language for APIs" },
        { id: "ws",      label: "WebSockets",  icon: "⚡", tooltip: "Full-duplex communication" },
        { id: "jwt-a",   label: "JWT Auth",    icon: "🔑", tooltip: "JSON Web Token auth" },
        { id: "oauth",   label: "OAuth 2.0",   icon: "🛡️", tooltip: "Industry auth framework" },
        { id: "session", label: "Session Auth",icon: "🍪", tooltip: "Server-side session handling" },
        { id: "mvc",     label: "MVC",         icon: "📐", tooltip: "Model-View-Controller pattern" },
        { id: "micro",   label: "Microservices",icon: "🧩",tooltip: "Distributed service architecture" },
        { id: "ssr",     label: "SSR",         icon: "🖥️", tooltip: "Server-Side Rendering" },
        { id: "crud",    label: "CRUD",        icon: "📝", tooltip: "Create Read Update Delete" },
      ],
    },
    {
      id: "auth-sec",
      label: "Auth & Security",
      icon: "🔐",
      color: "#f472b6",
      glow: "rgba(244,114,182,0.3)",
      skills: [
        { id: "jwt-s",    label: "JWT",             icon: "🔑", tooltip: "JSON Web Tokens" },
        { id: "oauth-s",  label: "OAuth 2.0",       icon: "🛡️", tooltip: "Delegated authorisation" },
        { id: "passport", label: "Passport.js",     icon: "📛", tooltip: "Auth middleware for Node.js" },
        { id: "bcrypt",   label: "bcrypt",          icon: "🔒", tooltip: "Password hashing library" },
        { id: "cors",     label: "CORS",            icon: "🌐", tooltip: "Cross-origin resource sharing" },
        { id: "helmet",   label: "Helmet.js",       icon: "⛑️", tooltip: "HTTP security headers" },
        { id: "rate",     label: "Rate Limiting",   icon: "⏱️", tooltip: "Throttle incoming requests" },
        { id: "input",    label: "Input Validation",icon: "✅", tooltip: "Sanitise & validate user input" },
        { id: "api-sec",  label: "API Security",    icon: "🛡️", tooltip: "Secure API design practices" },
      ],
    },
    {
      id: "realtime",
      label: "Real-Time Tech",
      icon: "📨",
      color: "#34d399",
      glow: "rgba(52,211,153,0.3)",
      skills: [
        { id: "socketio", label: "Socket.IO",  icon: "🔌", tooltip: "Real-time bidirectional events" },
        { id: "ws2",      label: "WebSockets", icon: "⚡", tooltip: "Native WS protocol" },
        { id: "webhooks", label: "Webhooks",   icon: "🪝", tooltip: "HTTP callbacks on events" },
      ],
    },
    {
      id: "devops",
      label: "Deployment / DevOps",
      icon: "☁️",
      color: "#38bdf8",
      glow: "rgba(56,189,248,0.3)",
      skills: [
        { id: "git",    label: "Git",          icon: "📦", tooltip: "Distributed version control" },
        { id: "github", label: "GitHub",       icon: "🐙", tooltip: "Code hosting & CI/CD" },
        { id: "vercel", label: "Vercel",       icon: "▲",  tooltip: "Frontend / Edge deployment" },
        { id: "render", label: "Render",       icon: "🚀", tooltip: "Cloud application platform" },
        { id: "railway",label: "Railway",      icon: "🚂", tooltip: "Infrastructure platform" },
        { id: "aws",    label: "AWS",          icon: "☁️", tooltip: "Amazon Web Services" },
        { id: "azure",  label: "Azure",        icon: "🔷", tooltip: "Microsoft cloud platform" },
        { id: "gcloud", label: "Google Cloud", icon: "🌐", tooltip: "Google cloud platform" },
      ],
    },
    {
      id: "testing",
      label: "Backend Testing",
      icon: "🧪",
      color: "#fb923c",
      glow: "rgba(251,146,60,0.3)",
      skills: [
        { id: "postman", label: "Postman", icon: "📮", tooltip: "API testing & documentation" },
      ],
    },
  ],
};

/* ══════════════════════════════════════════
   GEOMETRY
══════════════════════════════════════════ */

const W = 1200, H = 1200, CX = W / 2, CY = H / 2;
const ROOT_R  = 72;
const CAT_R   = 220;   // root → category orbit
const GRP_R   = 120;   // category → sub-group orbit
const LEAF_R  = 100;   // sub-group → leaf  OR  category → leaf

function polar(ox: number, oy: number, r: number, a: number) {
  return { x: ox + r * Math.cos(a), y: oy + r * Math.sin(a) };
}

function angleFor(i: number, total: number, offset = -Math.PI / 2) {
  return offset + (i / total) * 2 * Math.PI;
}

function qBez(x1: number, y1: number, x2: number, y2: number) {
  return `M${x1},${y1} Q${(x1 + x2) / 2},${(y1 + y2) / 2} ${x2},${y2}`;
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */

export default function BackendMindMap({ data = BACKEND_MAP_DATA }: { data?: BackendMapData }) {
  /* expansion state */
  const [rootOpen,    setRootOpen]    = useState(false);
  const [openCats,    setOpenCats]    = useState<Set<string>>(new Set());
  const [openGroups,  setOpenGroups]  = useState<Set<string>>(new Set());
  const [activeLeaf,  setActiveLeaf]  = useState<string | null>(null);

  /* tooltip */
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);

  /* pan / zoom */
  const [zoom,   setZoom]   = useState(1);
  const [pan,    setPan]    = useState({ x: 0, y: 0 });
  const dragging            = useRef(false);
  const lastPos             = useRef({ x: 0, y: 0 });
  const containerRef        = useRef<HTMLDivElement>(null);
  const svgRef              = useRef<SVGSVGElement>(null);

  const { categories, accent } = data;

  /* ── toggles ── */
  const toggleRoot = () => {
    setRootOpen((v) => {
      if (v) { setOpenCats(new Set()); setOpenGroups(new Set()); setActiveLeaf(null); }
      return !v;
    });
  };

  const toggleCat = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenCats((prev) => {
      const n = new Set(prev);
      if (n.has(id)) { n.delete(id); }
      else { n.add(id); }
      return n;
    });
  }, []);

  const toggleGroup = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenGroups((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }, []);

  const expandAll = () => {
    setRootOpen(true);
    setOpenCats(new Set(categories.map((c) => c.id)));
    const groups: string[] = [];
    categories.forEach((c) => c.groups?.forEach((g) => groups.push(g.id)));
    setOpenGroups(new Set(groups));
  };

  const collapseAll = () => {
    setRootOpen(false);
    setOpenCats(new Set());
    setOpenGroups(new Set());
    setActiveLeaf(null);
  };

  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };
  const zoomIn    = () => setZoom((z) => Math.min(z + 0.2, 3));
  const zoomOut   = () => setZoom((z) => Math.max(z - 0.2, 0.3));

  /* ── pan via pointer drag ── */
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    lastPos.current  = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
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

  /* ── tooltip helper ── */
  const showTip = useCallback((e: React.MouseEvent<SVGGElement>, text: string) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTip({ x: e.clientX - rect.left, y: e.clientY - rect.top - 14, text });
  }, []);
  const hideTip = useCallback(() => setTip(null), []);

  /* ── pre-compute all positions ── */
  const layout = useMemo(() => {
    const total = categories.length;

    return categories.map((cat, ci) => {
      const catAngle = angleFor(ci, total);
      const catPos   = polar(CX, CY, CAT_R, catAngle);

      /* flat skills */
      const skillLayout = (cat.skills ?? []).map((sk, si, arr) => {
        const spread = Math.min(Math.PI * 0.7, arr.length * 0.38);
        const sa = arr.length === 1
          ? catAngle
          : catAngle - spread / 2 + (si / (arr.length - 1)) * spread;
        return { sk, pos: polar(catPos.x, catPos.y, LEAF_R, sa) };
      });

      /* sub-groups */
      const groupLayout = (cat.groups ?? []).map((grp, gi, garr) => {
        const gSpread = Math.min(Math.PI * 0.65, garr.length * 0.55);
        const ga = garr.length === 1
          ? catAngle
          : catAngle - gSpread / 2 + (gi / (garr.length - 1)) * gSpread;
        const grpPos = polar(catPos.x, catPos.y, GRP_R, ga);

        const leafLayout = grp.children.map((lf, li, larr) => {
          const lSpread = Math.min(Math.PI * 0.6, larr.length * 0.42);
          const la = larr.length === 1
            ? ga
            : ga - lSpread / 2 + (li / (larr.length - 1)) * lSpread;
          return { lf, pos: polar(grpPos.x, grpPos.y, LEAF_R, la) };
        });

        return { grp, grpPos, leafLayout };
      });

      return { cat, catAngle, catPos, skillLayout, groupLayout };
    });
  }, [categories]);

  /* ══════════════════════════════════════════
     RENDER HELPERS
  ══════════════════════════════════════════ */

  const renderLabel = (
    text: string,
    x: number,
    y: number,
    fill: string,
    size: number,
    bold = false,
  ) => {
    const words = text.split(" ");
    if (words.length <= 2) {
      return (
        <text x={x} y={y} fontSize={size} fill={fill} textAnchor="middle"
          dominantBaseline="middle" fontFamily="var(--font-body)"
          fontWeight={bold ? "600" : "400"}>
          {text}
        </text>
      );
    }
    const half  = Math.ceil(words.length / 2);
    const line1 = words.slice(0, half).join(" ");
    const line2 = words.slice(half).join(" ");
    return (
      <>
        <text x={x} y={y - size * 0.7} fontSize={size} fill={fill} textAnchor="middle"
          dominantBaseline="middle" fontFamily="var(--font-body)" fontWeight={bold ? "600" : "400"}>
          {line1}
        </text>
        <text x={x} y={y + size * 0.7} fontSize={size} fill={fill} textAnchor="middle"
          dominantBaseline="middle" fontFamily="var(--font-body)" fontWeight={bold ? "600" : "400"}>
          {line2}
        </text>
      </>
    );
  };

  /* leaf node (deepest skill) */
  const renderLeaf = (
    lf: LeafNode,
    pos: { x: number; y: number },
    fromPos: { x: number; y: number },
    color: string,
    visible: boolean,
  ) => {
    const active = activeLeaf === lf.id;
    return (
      <g key={lf.id}>
        {/* line */}
        <path d={qBez(fromPos.x, fromPos.y, pos.x, pos.y)}
          fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round"
          opacity={visible ? 0.3 : 0}
          style={{ transition: "opacity 0.3s" }}
        />
        {/* node */}
        <g
          style={{
            opacity:   visible ? 1 : 0,
            transform: `translate(${visible ? pos.x : fromPos.x}px,${visible ? pos.y : fromPos.y}px)`,
            transition: "opacity 0.3s, transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
            cursor: "default",
          }}
          onMouseEnter={(e) => { showTip(e, lf.tooltip); setActiveLeaf(lf.id); }}
          onMouseLeave={() => { hideTip(); setActiveLeaf(null); }}
        >
          <circle r={active ? 32 : 26} fill={color} opacity={active ? 0.18 : 0.08}
            style={{ transition: "r 0.2s, opacity 0.2s" }} />
          <rect x={-36} y={-16} width={72} height={32} rx={9}
            fill="rgba(10,10,10,0.82)"
            stroke={active ? color : "rgba(255,255,255,0.1)"}
            strokeWidth={active ? 1.5 : 0.8}
            style={{ transition: "stroke 0.2s" }}
          />
          <text x={-20} y={0} fontSize={11} textAnchor="middle" dominantBaseline="middle">{lf.icon}</text>
          <text x={10} y={0} fontSize={8.5} fill={active ? "#ededea" : "#7a7a76"}
            textAnchor="middle" dominantBaseline="middle"
            fontFamily="var(--font-body)"
            style={{ transition: "fill 0.2s" }}>
            {lf.label.length > 11 ? lf.label.slice(0, 10) + "…" : lf.label}
          </text>
        </g>
      </g>
    );
  };

  /* sub-group node */
  const renderGroup = (
    grpData: (typeof layout)[number]["groupLayout"][number],
    catPos: { x: number; y: number },
    color: string,
    catVisible: boolean,
  ) => {
    const { grp, grpPos, leafLayout } = grpData;
    const grpVisible  = catVisible && openGroups.has(grp.id);
    const leafVisible = grpVisible;

    return (
      <g key={grp.id}>
        {/* cat → group line */}
        <path d={qBez(catPos.x, catPos.y, grpPos.x, grpPos.y)}
          fill="none" stroke={color} strokeWidth="1" strokeLinecap="round"
          opacity={catVisible ? 0.35 : 0}
          style={{ transition: "opacity 0.4s" }}
        />

        {/* group node */}
        <g
          style={{
            opacity:   catVisible ? 1 : 0,
            transform: `translate(${catVisible ? grpPos.x : catPos.x}px,${catVisible ? grpPos.y : catPos.y}px)`,
            transition: "opacity 0.35s, transform 0.45s cubic-bezier(0.34,1.4,0.64,1)",
            cursor: "pointer",
          }}
          onClick={(e) => toggleGroup(grp.id, e)}
          role="button"
          aria-expanded={grpVisible}
        >
          <circle r={openGroups.has(grp.id) ? 42 : 36} fill={color} opacity="0.1"
            style={{ transition: "r 0.25s" }} />
          <rect x={-42} y={-20} width={84} height={40} rx={11}
            fill="rgba(10,10,10,0.85)"
            stroke={openGroups.has(grp.id) ? color : "rgba(255,255,255,0.15)"}
            strokeWidth={openGroups.has(grp.id) ? 1.5 : 0.9}
            style={{ transition: "stroke 0.25s" }}
          />
          <text x={-24} y={0} fontSize={12} textAnchor="middle" dominantBaseline="middle">{grp.icon}</text>
          {renderLabel(grp.label, 8, 0, openGroups.has(grp.id) ? color : "#ededea", 9, true)}
          <text x={36} y={0} fontSize={9} fill={color} textAnchor="middle" dominantBaseline="middle" opacity={0.9}>
            {openGroups.has(grp.id) ? "−" : "+"}
          </text>
        </g>

        {/* leaves */}
        {leafLayout.map(({ lf, pos }) =>
          renderLeaf(lf, pos, grpPos, color, leafVisible)
        )}
      </g>
    );
  };

  /* ══════════════════════════════════════════
     MAIN RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="relative w-full select-none" aria-label="Backend Development Mind Map">

      {/* ── Controls bar ── */}
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

      {/* ── hint ── */}
      {!rootOpen && (
        <p className="mb-4 animate-pulse text-center font-body text-xs text-fog/60">
          Click the center node to begin · Drag to pan · Scroll to zoom
        </p>
      )}

      {/* ── Canvas ── */}
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
          style={{ transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`, transformOrigin: "center", transition: dragging.current ? "none" : "transform 0.1s" }}
        >
          <defs>
            <radialGradient id="be-root-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={accent} stopOpacity="0.25" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </radialGradient>
            {categories.map((c) => (
              <radialGradient key={c.id} id={`be-grad-${c.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={c.color} stopOpacity="0.2" />
                <stop offset="100%" stopColor={c.color} stopOpacity="0" />
              </radialGradient>
            ))}
            <filter id="be-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* ══ LINES root→cat ══ */}
          {layout.map(({ cat, catPos }) => (
            <path key={`rl-${cat.id}`}
              d={qBez(CX, CY, catPos.x, catPos.y)}
              fill="none" stroke={cat.color} strokeWidth="1.5" strokeLinecap="round"
              opacity={rootOpen ? 0.45 : 0}
              style={{ transition: "opacity 0.5s" }}
            />
          ))}

          {/* ══ CATEGORY NODES + their children ══ */}
          {layout.map(({ cat, catPos, skillLayout, groupLayout }) => {
            const catOpen = openCats.has(cat.id);
            const catVis  = rootOpen;

            return (
              <g key={cat.id}>
                {/* ── flat skill lines ── */}
                {skillLayout.map(({ sk, pos }) => (
                  <path key={`sl-${sk.id}`}
                    d={qBez(catPos.x, catPos.y, pos.x, pos.y)}
                    fill="none" stroke={cat.color} strokeWidth="0.8" strokeLinecap="round"
                    opacity={catOpen ? 0.3 : 0}
                    style={{ transition: "opacity 0.35s" }}
                  />
                ))}

                {/* ── flat skill nodes ── */}
                {skillLayout.map(({ sk, pos }) =>
                  renderLeaf(sk, pos, catPos, cat.color, catOpen)
                )}

                {/* ── sub-groups ── */}
                {groupLayout.map((grpData) =>
                  renderGroup(grpData, catPos, cat.color, catOpen)
                )}

                {/* ── CATEGORY NODE (rendered on top of lines) ── */}
                <g
                  style={{
                    opacity:   catVis ? 1 : 0,
                    transform: `translate(${catVis ? catPos.x : CX}px,${catVis ? catPos.y : CY}px)`,
                    transition: "opacity 0.45s, transform 0.55s cubic-bezier(0.34,1.4,0.64,1)",
                    cursor: "pointer",
                  }}
                  onClick={(e) => toggleCat(cat.id, e)}
                  role="button"
                  aria-expanded={catOpen}
                  aria-label={`${cat.label} — ${catOpen ? "collapse" : "expand"}`}
                >
                  <circle r={catOpen ? 58 : 50} fill={`url(#be-grad-${cat.id})`}
                    style={{ transition: "r 0.3s" }} />
                  <rect x={-56} y={-26} width={112} height={52} rx={14}
                    fill="rgba(8,8,8,0.88)"
                    stroke={catOpen ? cat.color : "rgba(255,255,255,0.15)"}
                    strokeWidth={catOpen ? 2 : 1}
                    filter={catOpen ? "url(#be-glow)" : undefined}
                    style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
                  />
                  <text x={-34} y={0} fontSize={15} textAnchor="middle" dominantBaseline="middle">{cat.icon}</text>
                  {renderLabel(cat.label, 12, 0, catOpen ? cat.color : "#ededea", 9.5, true)}
                  <text x={46} y={0} fontSize={10} fill={cat.color} textAnchor="middle" dominantBaseline="middle" opacity={0.85}>
                    {catOpen ? "−" : "+"}
                  </text>
                </g>
              </g>
            );
          })}

          {/* ══ ROOT GLOW ══ */}
          <circle cx={CX} cy={CY} r={ROOT_R + 36} fill="url(#be-root-grad)"
            opacity={rootOpen ? 1 : 0.5} style={{ transition: "opacity 0.5s" }} />

          {/* ══ ROOT NODE ══ */}
          <g onClick={toggleRoot} style={{ cursor: "pointer" }}
            role="button" aria-expanded={rootOpen} aria-label="Backend Development — toggle">
            <circle cx={CX} cy={CY} r={ROOT_R + 16}
              fill="none" stroke={accent} strokeWidth="1"
              opacity={rootOpen ? 0.45 : 0.2} style={{ transition: "opacity 0.4s" }} />
            <circle cx={CX} cy={CY} r={ROOT_R}
              fill="rgba(8,8,8,0.95)" stroke={accent}
              strokeWidth={rootOpen ? 2.5 : 1.5}
              filter="url(#be-glow)"
              style={{ transition: "stroke-width 0.3s" }} />
            {data.root.split("\n").map((line, i, arr) => (
              <text key={i}
                x={CX} y={CY + (i - (arr.length - 1) / 2) * 14}
                fontSize={12} fill={accent}
                textAnchor="middle" dominantBaseline="middle"
                fontFamily="var(--font-display)" fontStyle="italic" fontWeight="700">
                {line}
              </text>
            ))}
            <circle cx={CX} cy={CY + ROOT_R - 12} r={3}
              fill={accent} opacity={rootOpen ? 0 : 0.7} style={{ transition: "opacity 0.4s" }} />
          </g>
        </svg>

        {/* ── Tooltip ── */}
        {tip && (
          <div className="pointer-events-none absolute z-20 rounded-lg border border-white/10 bg-ink/95 px-3 py-1.5 font-body text-xs text-paper shadow-xl backdrop-blur-md"
            style={{ left: tip.x, top: tip.y, transform: "translate(-50%,-100%)" }}>
            {tip.text}
          </div>
        )}
      </div>

      {/* ══ MOBILE ACCORDION (< lg) ══ */}
      <div className="mt-10 lg:hidden">
        <p className="mb-4 font-body text-xs text-fog/60">Tap categories to explore</p>
        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <MobileAccordion key={cat.id} cat={cat} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MOBILE ACCORDION
══════════════════════════════════════════ */

function MobileAccordion({ cat }: { cat: CategoryNode }) {
  const [open, setOpen] = useState(false);
  const allLeaves: LeafNode[] = cat.skills
    ? cat.skills
    : (cat.groups ?? []).flatMap((g) => g.children);

  return (
    <div className="overflow-hidden rounded-xl border border-line"
      style={{ borderColor: open ? cat.color + "66" : undefined }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="text-lg">{cat.icon}</span>
        <span className="flex-1 font-body text-sm font-medium text-paper">{cat.label}</span>
        <span className="font-body text-xs" style={{ color: cat.color }}>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="border-t border-line/50 px-4 pb-4 pt-3">
          {/* sub-groups */}
          {cat.groups?.map((grp) => (
            <div key={grp.id} className="mb-3">
              <p className="mb-2 flex items-center gap-1.5 font-body text-xs font-medium"
                style={{ color: cat.color }}>
                <span>{grp.icon}</span>{grp.label}
              </p>
              <div className="flex flex-wrap gap-2 pl-3">
                {grp.children.map((lf) => (
                  <MobileChip key={lf.id} lf={lf} color={cat.color} />
                ))}
              </div>
            </div>
          ))}
          {/* flat skills */}
          {cat.skills && (
            <div className="flex flex-wrap gap-2">
              {cat.skills.map((lf) => (
                <MobileChip key={lf.id} lf={lf} color={cat.color} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MobileChip({ lf, color }: { lf: LeafNode; color: string }) {
  const [show, setShow] = useState(false);
  return (
    <button
      onClick={() => setShow((v) => !v)}
      title={lf.tooltip}
      className="flex items-center gap-1.5 rounded-lg border border-line bg-white/[0.04] px-3 py-1.5 font-body text-xs text-fog transition-all active:scale-95"
      style={{ borderColor: show ? color + "80" : undefined, color: show ? "#ededea" : undefined }}
    >
      <span>{lf.icon}</span>{lf.label}
    </button>
  );
}
