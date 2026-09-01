"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  type PointerEvent as ReactPointerEvent,
} from "react";

/* ══════════════════════════════════════════════════════════════
   DATA TYPES
══════════════════════════════════════════════════════════════ */

interface Leaf   { id: string; label: string; icon: string; tooltip: string }
interface SubGrp { id: string; label: string; icon: string; children: Leaf[] }

interface Category {
  id: string; label: string; icon: string; color: string; glow: string;
  skills?: Leaf[];
  groups?: SubGrp[];
}

interface Branch {
  id: string; label: string; icon: string; color: string; glow: string;
  categories: Category[];
}

interface RootData { label: string; icon: string; accent: string; branches: Branch[] }

/* ══════════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════════ */

const DATA: RootData = {
  label: "SKILLS",
  icon:  "🧠",
  accent: "#c9a24b",
  branches: [
    /* ── FRONTEND ── */
    {
      id: "frontend", label: "Frontend\nDevelopment", icon: "🎨",
      color: "#60a5fa", glow: "rgba(96,165,250,0.32)",
      categories: [
        {
          id: "fe-lang", label: "Frontend\nLanguages", icon: "🎨",
          color: "#facc15", glow: "rgba(250,204,21,0.28)",
          skills: [
            { id: "html5",  label: "HTML5",          icon: "🌐", tooltip: "Semantic markup & page structure" },
            { id: "css3",   label: "CSS3",           icon: "🎨", tooltip: "Styling, animations & responsive design" },
            { id: "js",     label: "JS ES6+",        icon: "⚡", tooltip: "Modern JavaScript with ES modules" },
          ],
        },
        {
          id: "fe-fw", label: "Frameworks &\nLibraries", icon: "⚛️",
          color: "#61dafb", glow: "rgba(97,218,251,0.28)",
          skills: [
            { id: "react",  label: "React.js", icon: "⚛️", tooltip: "Component-driven UI library" },
            { id: "nextjs", label: "Next.js",  icon: "▲",  tooltip: "Full-stack React framework" },
          ],
        },
        {
          id: "fe-css", label: "CSS & UI", icon: "🖌️",
          color: "#38bdf8", glow: "rgba(56,189,248,0.28)",
          skills: [
            { id: "tailwind",  label: "Tailwind",  icon: "💨", tooltip: "Utility-first CSS framework" },
            { id: "bootstrap", label: "Bootstrap", icon: "🅱️", tooltip: "Component CSS framework" },
          ],
        },
        {
          id: "fe-anim", label: "Animation &\nInteractive", icon: "✨",
          color: "#a78bfa", glow: "rgba(167,139,250,0.28)",
          skills: [
            { id: "gsap",   label: "GSAP",         icon: "🟢", tooltip: "Professional JS animation" },
            { id: "framer", label: "Framer Motion",icon: "🎭", tooltip: "React animation library" },
            { id: "three",  label: "Three.js",     icon: "🔷", tooltip: "3D WebGL rendering" },
            { id: "r3f",    label: "R3F",          icon: "🌐", tooltip: "React renderer for Three.js" },
          ],
        },
        {
          id: "fe-tools", label: "Frontend\nTools", icon: "🛠️",
          color: "#fb923c", glow: "rgba(251,146,60,0.28)",
          skills: [
            { id: "vite", label: "Vite", icon: "⚡", tooltip: "Lightning-fast build tool" },
            { id: "npm",  label: "npm",  icon: "📦", tooltip: "Node package manager" },
            { id: "pnpm", label: "pnpm", icon: "📦", tooltip: "Fast, disk-efficient package manager" },
          ],
        },
        {
          id: "fe-api", label: "API & State", icon: "🔌",
          color: "#34d399", glow: "rgba(52,211,153,0.28)",
          skills: [
            { id: "rest",    label: "REST API",    icon: "🔗", tooltip: "RESTful HTTP services" },
            { id: "axios",   label: "Axios",       icon: "📡", tooltip: "Promise-based HTTP client" },
            { id: "fetch",   label: "Fetch API",   icon: "🌊", tooltip: "Native browser fetch" },
            { id: "context", label: "Context API", icon: "🔄", tooltip: "React state management" },
          ],
        },
        {
          id: "fe-web", label: "Web\nDevelopment", icon: "📱",
          color: "#f472b6", glow: "rgba(244,114,182,0.28)",
          skills: [
            { id: "rwd",    label: "Responsive", icon: "📐", tooltip: "Fluid layouts for all screens" },
            { id: "mobile", label: "Mobile-First",icon: "📱", tooltip: "Design for mobile first" },
          ],
        },
      ],
    },

    /* ── BACKEND ── */
    {
      id: "backend", label: "Backend\nDevelopment", icon: "⚙️",
      color: "#4ade80", glow: "rgba(74,222,128,0.32)",
      categories: [
        {
          id: "be-lang", label: "Backend\nLanguages", icon: "🖥️",
          color: "#facc15", glow: "rgba(250,204,21,0.28)",
          skills: [
            { id: "be-js",  label: "JavaScript", icon: "🟨", tooltip: "Node.js runtime — async I/O" },
            { id: "be-ts",  label: "TypeScript", icon: "🔷", tooltip: "Typed superset of JavaScript" },
            { id: "python", label: "Python",     icon: "🐍", tooltip: "Versatile backend language" },
            { id: "cpp",    label: "C++",        icon: "⚙️", tooltip: "High-performance systems language" },
            { id: "php",    label: "PHP",        icon: "🐘", tooltip: "Server-side scripting language" },
          ],
        },
        {
          id: "be-fw", label: "Frameworks &\nRuntime", icon: "🚀",
          color: "#60a5fa", glow: "rgba(96,165,250,0.28)",
          groups: [
            {
              id: "node-eco", label: "Node.js Eco", icon: "🟩",
              children: [
                { id: "nodejs",   label: "Node.js",    icon: "🟩", tooltip: "JavaScript runtime on V8" },
                { id: "express",  label: "Express.js", icon: "🚂", tooltip: "Minimal Node.js framework" },
                { id: "nestjs",   label: "NestJS",     icon: "🔺", tooltip: "Opinionated Node.js framework" },
              ],
            },
            {
              id: "py-fw", label: "Python", icon: "🐍",
              children: [
                { id: "django",  label: "Django",      icon: "🎸", tooltip: "Batteries-included Python framework" },
                { id: "drf",     label: "Django REST", icon: "🔌", tooltip: "Toolkit for building REST APIs" },
                { id: "flask",   label: "Flask",       icon: "🧪", tooltip: "Lightweight WSGI framework" },
                { id: "fastapi", label: "FastAPI",     icon: "⚡", tooltip: "High-perf async API framework" },
              ],
            },
            {
              id: "php-fw", label: "PHP", icon: "🐘",
              children: [
                { id: "laravel", label: "Laravel", icon: "🎯", tooltip: "Elegant PHP web framework" },
              ],
            },
          ],
        },
        {
          id: "be-db", label: "Databases", icon: "🗄️",
          color: "#f97316", glow: "rgba(249,115,22,0.28)",
          groups: [
            {
              id: "sql", label: "SQL", icon: "📋",
              children: [
                { id: "mysql",  label: "MySQL",      icon: "🐬", tooltip: "Popular open-source RDBMS" },
                { id: "psql",   label: "PostgreSQL", icon: "🐘", tooltip: "Advanced open-source RDBMS" },
                { id: "mssql",  label: "MSSQL",      icon: "🪟", tooltip: "Microsoft SQL Server" },
                { id: "sqlite", label: "SQLite",     icon: "📁", tooltip: "Embedded relational database" },
              ],
            },
            {
              id: "nosql", label: "NoSQL", icon: "🍃",
              children: [
                { id: "mongo", label: "MongoDB", icon: "🍃", tooltip: "Document-oriented NoSQL database" },
              ],
            },
          ],
        },
        {
          id: "be-api", label: "API &\nArchitecture", icon: "🔌",
          color: "#a78bfa", glow: "rgba(167,139,250,0.28)",
          skills: [
            { id: "be-rest",   label: "REST API",      icon: "🔗", tooltip: "Representational state transfer" },
            { id: "graphql",   label: "GraphQL",       icon: "◉",  tooltip: "Query language for APIs" },
            { id: "be-ws",     label: "WebSockets",    icon: "⚡", tooltip: "Full-duplex communication" },
            { id: "jwt-auth",  label: "JWT Auth",      icon: "🔑", tooltip: "JSON Web Token auth" },
            { id: "oauth2",    label: "OAuth 2.0",     icon: "🛡️", tooltip: "Industry auth framework" },
            { id: "session",   label: "Session Auth",  icon: "🍪", tooltip: "Server-side sessions" },
            { id: "mvc",       label: "MVC",           icon: "📐", tooltip: "Model-View-Controller pattern" },
            { id: "micro",     label: "Microservices", icon: "🧩", tooltip: "Distributed service architecture" },
            { id: "ssr",       label: "SSR",           icon: "🖥️", tooltip: "Server-Side Rendering" },
            { id: "crud",      label: "CRUD",          icon: "📝", tooltip: "Create Read Update Delete" },
          ],
        },
        {
          id: "be-sec", label: "Auth &\nSecurity", icon: "🔐",
          color: "#f472b6", glow: "rgba(244,114,182,0.28)",
          skills: [
            { id: "jwt-s",    label: "JWT",             icon: "🔑", tooltip: "JSON Web Tokens" },
            { id: "oauth-s",  label: "OAuth 2.0",       icon: "🛡️", tooltip: "Delegated authorisation" },
            { id: "passport", label: "Passport.js",     icon: "📛", tooltip: "Auth middleware for Node.js" },
            { id: "bcrypt",   label: "bcrypt",          icon: "🔒", tooltip: "Password hashing" },
            { id: "cors",     label: "CORS",            icon: "🌐", tooltip: "Cross-origin resource sharing" },
            { id: "helmet",   label: "Helmet.js",       icon: "⛑️", tooltip: "HTTP security headers" },
            { id: "rate",     label: "Rate Limiting",   icon: "⏱️", tooltip: "Throttle requests" },
            { id: "validate", label: "Validation",      icon: "✅", tooltip: "Sanitise & validate input" },
            { id: "api-sec",  label: "API Security",    icon: "🛡️", tooltip: "Secure API design" },
          ],
        },
        {
          id: "be-rt", label: "Real-Time\nTech", icon: "📨",
          color: "#34d399", glow: "rgba(52,211,153,0.28)",
          skills: [
            { id: "socketio",  label: "Socket.IO",  icon: "🔌", tooltip: "Real-time bidirectional events" },
            { id: "ws-rt",     label: "WebSockets", icon: "⚡", tooltip: "Native WS protocol" },
            { id: "webhooks",  label: "Webhooks",   icon: "🪝", tooltip: "HTTP callbacks on events" },
          ],
        },
        {
          id: "be-devops", label: "Deployment /\nDevOps", icon: "☁️",
          color: "#38bdf8", glow: "rgba(56,189,248,0.28)",
          skills: [
            { id: "git",     label: "Git",          icon: "📦", tooltip: "Distributed version control" },
            { id: "github",  label: "GitHub",       icon: "🐙", tooltip: "Code hosting & CI/CD" },
            { id: "vercel",  label: "Vercel",       icon: "▲",  tooltip: "Frontend / Edge deployment" },
            { id: "render",  label: "Render",       icon: "🚀", tooltip: "Cloud app platform" },
            { id: "railway", label: "Railway",      icon: "🚂", tooltip: "Infrastructure platform" },
            { id: "aws",     label: "AWS",          icon: "☁️", tooltip: "Amazon Web Services" },
            { id: "azure",   label: "Azure",        icon: "🔷", tooltip: "Microsoft cloud" },
            { id: "gcloud",  label: "GCloud",       icon: "🌐", tooltip: "Google Cloud Platform" },
          ],
        },
        {
          id: "be-test", label: "Backend\nTesting", icon: "🧪",
          color: "#fb923c", glow: "rgba(251,146,60,0.28)",
          skills: [
            { id: "postman", label: "Postman", icon: "📮", tooltip: "API testing & documentation" },
          ],
        },
      ],
    },

    /* ── AI ── */
    {
      id: "ai", label: "AI Tools &\nPlatforms", icon: "🤖",
      color: "#a78bfa", glow: "rgba(167,139,250,0.32)",
      categories: [
        {
          id: "ai-code", label: "AI Coding\nTools", icon: "💻",
          color: "#60a5fa", glow: "rgba(96,165,250,0.28)",
          skills: [
            { id: "cursor",   label: "Cursor",   icon: "◎", tooltip: "AI-first code editor with LLM pair programming" },
            { id: "replit",   label: "Replit",   icon: "🔁", tooltip: "Browser IDE with built-in AI assistant" },
            { id: "kiro",     label: "Kiro",     icon: "🔺", tooltip: "AWS-integrated AI dev environment" },
            { id: "vscode",   label: "VS Code",  icon: "🔷", tooltip: "Extensible editor + GitHub Copilot" },
            { id: "windsurf", label: "Windsurf", icon: "🌊", tooltip: "AI-native editor for flow-state coding" },
            { id: "trae",     label: "Trae",     icon: "⚡", tooltip: "ByteDance's AI coding assistant IDE" },
          ],
        },
        {
          id: "ai-llm", label: "AI Assistants\n& LLMs", icon: "🧠",
          color: "#a78bfa", glow: "rgba(167,139,250,0.28)",
          skills: [
            { id: "gemini",   label: "Gemini",   icon: "♊", tooltip: "Google DeepMind's multimodal AI assistant" },
            { id: "deepseek", label: "DeepSeek", icon: "🔍", tooltip: "High-performance open-source reasoning model" },
            { id: "chatgpt",  label: "ChatGPT",  icon: "✦", tooltip: "OpenAI's flagship conversational AI" },
            { id: "claude",   label: "Claude",   icon: "◈", tooltip: "Anthropic's safety-focused LLM" },
          ],
        },
        {
          id: "ai-plat", label: "AI Online\nPlatforms", icon: "🌐",
          color: "#34d399", glow: "rgba(52,211,153,0.28)",
          skills: [
            { id: "emergent",  label: "Emergent",       icon: "🌱", tooltip: "AI full-stack app generation from prompts" },
            { id: "lovable",   label: "Lovable",        icon: "💖", tooltip: "Generate production React apps with AI" },
            { id: "base44",    label: "Base44",         icon: "🔢", tooltip: "AI-native rapid web application creation" },
            { id: "gflow",     label: "Google Flow",    icon: "🌊", tooltip: "Google's AI creative workflow platform" },
            { id: "gaistudio", label: "AI Studio",      icon: "🔬", tooltip: "Build & experiment with Gemini models" },
          ],
        },
      ],
    },
  ],
};

/* ══════════════════════════════════════════════════════════════
   GEOMETRY
══════════════════════════════════════════════════════════════ */

const W = 2000, H = 2000, CX = W / 2, CY = H / 2;

// orbital radii for each level
const R_BRANCH  = 200;   // root  → branch
const R_CAT     = 180;   // branch → category
const R_GRP     = 110;   // category → sub-group
const R_LEAF_F  = 105;   // category / subgrp → leaf (flat)

function polar(ox: number, oy: number, r: number, a: number) {
  return { x: ox + r * Math.cos(a), y: oy + r * Math.sin(a) };
}

function fanAngles(
  baseAngle: number,
  count: number,
  spreadPerItem: number,
  maxSpread: number,
): number[] {
  if (count === 1) return [baseAngle];
  const spread = Math.min(maxSpread, count * spreadPerItem);
  return Array.from({ length: count }, (_, i) =>
    baseAngle - spread / 2 + (i / (count - 1)) * spread,
  );
}

function qBez(x1: number, y1: number, x2: number, y2: number) {
  return `M${x1},${y1} Q${(x1+x2)/2},${(y1+y2)/2} ${x2},${y2}`;
}

/* ══════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════ */

export default function MasterSkillsMindMap() {
  // open state — sets of ids
  const [rootOpen,   setRootOpen]   = useState(false);
  const [openBr,     setOpenBr]     = useState<Set<string>>(new Set());
  const [openCat,    setOpenCat]    = useState<Set<string>>(new Set());
  const [openGrp,    setOpenGrp]    = useState<Set<string>>(new Set());
  const [activeLeaf, setActiveLeaf] = useState<string | null>(null);
  const [tip, setTip]               = useState<{ x: number; y: number; text: string } | null>(null);

  // pan / zoom
  const [zoom, setZoom] = useState(0.55);
  const [pan,  setPan]  = useState({ x: 0, y: 0 });
  const dragging        = useRef(false);
  const lastPos         = useRef({ x: 0, y: 0 });
  const containerRef    = useRef<HTMLDivElement>(null);
  const svgRef          = useRef<SVGSVGElement>(null);

  /* ── toggles ── */
  const toggleRoot = () =>
    setRootOpen((v) => { if (v) { setOpenBr(new Set()); setOpenCat(new Set()); setOpenGrp(new Set()); setActiveLeaf(null); } return !v; });

  const tog = useCallback((set: Set<string>, setter: (s: Set<string>) => void, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setter((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  const expandAll = () => {
    setRootOpen(true);
    setOpenBr(new Set(DATA.branches.map((b) => b.id)));
    const cats: string[] = [], grps: string[] = [];
    DATA.branches.forEach((b) => b.categories.forEach((c) => {
      cats.push(c.id);
      c.groups?.forEach((g) => grps.push(g.id));
    }));
    setOpenCat(new Set(cats));
    setOpenGrp(new Set(grps));
  };

  const collapseAll = () => { setRootOpen(false); setOpenBr(new Set()); setOpenCat(new Set()); setOpenGrp(new Set()); setActiveLeaf(null); };
  const resetView   = () => { setZoom(0.55); setPan({ x: 0, y: 0 }); };
  const zoomIn      = () => setZoom((z) => Math.min(z + 0.15, 2.5));
  const zoomOut     = () => setZoom((z) => Math.max(z - 0.15, 0.25));

  /* ── pointer pan ── */
  const onPD = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPM = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    setPan((p) => ({ x: p.x + e.clientX - lastPos.current.x, y: p.y + e.clientY - lastPos.current.y }));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onPU = () => { dragging.current = false; };

  /* ── wheel ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const h = (e: WheelEvent) => { e.preventDefault(); setZoom((z) => Math.min(Math.max(z - e.deltaY * 0.001, 0.25), 2.5)); };
    el.addEventListener("wheel", h, { passive: false });
    return () => el.removeEventListener("wheel", h);
  }, []);

  /* ── tooltip ── */
  const showTip = useCallback((e: React.MouseEvent<SVGGElement>, text: string) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r) return;
    setTip({ x: e.clientX - r.left, y: e.clientY - r.top - 14, text });
  }, []);
  const hideTip = useCallback(() => setTip(null), []);

  /* ── pre-compute layout ── */
  const layout = useMemo(() => {
    const total = DATA.branches.length;
    return DATA.branches.map((branch, bi) => {
      const brAngle = ((bi / total) * 2 * Math.PI) - Math.PI / 2;
      const brPos   = polar(CX, CY, R_BRANCH, brAngle);

      const catAngles = fanAngles(brAngle, branch.categories.length, 0.42, Math.PI * 0.78);
      const cats = branch.categories.map((cat, ci) => {
        const ca    = catAngles[ci];
        const cPos  = polar(brPos.x, brPos.y, R_CAT, ca);

        // flat skills
        const skillAngles = fanAngles(ca, (cat.skills ?? []).length, 0.38, Math.PI * 0.72);
        const skills = (cat.skills ?? []).map((sk, si) => ({
          sk, pos: polar(cPos.x, cPos.y, R_LEAF_F, skillAngles[si]),
        }));

        // sub-groups
        const grpAngles = fanAngles(ca, (cat.groups ?? []).length, 0.52, Math.PI * 0.65);
        const groups = (cat.groups ?? []).map((grp, gi) => {
          const ga   = grpAngles[gi];
          const gPos = polar(cPos.x, cPos.y, R_GRP, ga);
          const lfAngles = fanAngles(ga, grp.children.length, 0.4, Math.PI * 0.6);
          const leaves = grp.children.map((lf, li) => ({
            lf, pos: polar(gPos.x, gPos.y, R_LEAF_F, lfAngles[li]),
          }));
          return { grp, gPos, leaves };
        });

        return { cat, ca, cPos, skills, groups };
      });

      return { branch, brAngle, brPos, cats };
    });
  }, []);

  /* ── SVG label helper ── */
  const lbl = (text: string, x: number, y: number, fill: string, size: number, bold = false) => {
    const parts = text.split("\n");
    if (parts.length === 1) {
      const words = text.split(" ");
      if (words.length <= 2) return (
        <text x={x} y={y} fontSize={size} fill={fill} textAnchor="middle" dominantBaseline="middle"
          fontFamily="var(--font-body)" fontWeight={bold ? "600" : "400"}>{text}</text>
      );
      const half = Math.ceil(words.length / 2);
      return <>
        <text x={x} y={y - size * 0.72} fontSize={size} fill={fill} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-body)" fontWeight={bold ? "600" : "400"}>{words.slice(0, half).join(" ")}</text>
        <text x={x} y={y + size * 0.72} fontSize={size} fill={fill} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-body)" fontWeight={bold ? "600" : "400"}>{words.slice(half).join(" ")}</text>
      </>;
    }
    return <>
      {parts.map((p, i) => (
        <text key={i} x={x} y={y + (i - (parts.length - 1) / 2) * size * 1.45}
          fontSize={size} fill={fill} textAnchor="middle" dominantBaseline="middle"
          fontFamily="var(--font-body)" fontWeight={bold ? "600" : "400"}>{p}</text>
      ))}
    </>;
  };

  /* ── leaf node ── */
  const renderLeaf = (lf: Leaf, pos: { x: number; y: number }, from: { x: number; y: number }, color: string, visible: boolean) => {
    const act = activeLeaf === lf.id;
    return (
      <g key={lf.id}>
        <path d={qBez(from.x, from.y, pos.x, pos.y)} fill="none" stroke={color} strokeWidth="0.7" strokeLinecap="round"
          opacity={visible ? (act ? 0.65 : 0.28) : 0} style={{ transition: "opacity 0.3s" }} />
        <g style={{
          opacity: visible ? 1 : 0,
          transform: `translate(${visible ? pos.x : from.x}px,${visible ? pos.y : from.y}px)`,
          transition: "opacity 0.32s ease, transform 0.42s cubic-bezier(0.34,1.4,0.64,1)",
          cursor: "default",
        }}
          onMouseEnter={(e) => { showTip(e, lf.tooltip); setActiveLeaf(lf.id); }}
          onMouseLeave={() => { hideTip(); setActiveLeaf(null); }}>
          <circle r={act ? 32 : 26} fill={color} opacity={act ? 0.17 : 0.07} style={{ transition: "r 0.2s" }} />
          <rect x={-38} y={-16} width={76} height={32} rx={9}
            fill="rgba(8,8,8,0.88)" stroke={act ? color : "rgba(255,255,255,0.09)"}
            strokeWidth={act ? 1.5 : 0.7} style={{ transition: "stroke 0.2s" }} />
          <text x={-21} y={0} fontSize={11} textAnchor="middle" dominantBaseline="middle">{lf.icon}</text>
          <text x={8} y={0} fontSize={8.5} fill={act ? "#ededea" : "#7a7a76"}
            textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-body)" style={{ transition: "fill 0.2s" }}>
            {lf.label.length > 11 ? lf.label.slice(0, 10) + "…" : lf.label}
          </text>
        </g>
      </g>
    );
  };

  /* ── sub-group node ── */
  const renderGrp = (
    grpData: ReturnType<typeof layout>[number]["cats"][number]["groups"][number],
    cPos: { x: number; y: number }, color: string, catVisible: boolean,
  ) => {
    const { grp, gPos, leaves } = grpData;
    const gVis = catVisible && openGrp.has(grp.id);
    return (
      <g key={grp.id}>
        <path d={qBez(cPos.x, cPos.y, gPos.x, gPos.y)} fill="none" stroke={color} strokeWidth="0.9" strokeLinecap="round"
          opacity={catVisible ? 0.35 : 0} style={{ transition: "opacity 0.38s" }} />
        <g style={{
          opacity: catVisible ? 1 : 0,
          transform: `translate(${catVisible ? gPos.x : cPos.x}px,${catVisible ? gPos.y : cPos.y}px)`,
          transition: "opacity 0.35s ease, transform 0.45s cubic-bezier(0.34,1.4,0.64,1)",
          cursor: "pointer",
        }}
          onClick={(e) => tog(openGrp, setOpenGrp, grp.id, e)} role="button" aria-expanded={gVis}>
          <circle r={gVis ? 40 : 34} fill={color} opacity="0.09" style={{ transition: "r 0.25s" }} />
          <rect x={-40} y={-19} width={80} height={38} rx={10}
            fill="rgba(8,8,8,0.88)" stroke={gVis ? color : "rgba(255,255,255,0.13)"}
            strokeWidth={gVis ? 1.5 : 0.8} style={{ transition: "stroke 0.25s" }} />
          <text x={-23} y={0} fontSize={12} textAnchor="middle" dominantBaseline="middle">{grp.icon}</text>
          {lbl(grp.label, 8, 0, gVis ? color : "#ededea", 8.5, true)}
          <text x={34} y={0} fontSize={9} fill={color} textAnchor="middle" dominantBaseline="middle" opacity={0.9}>{gVis ? "−" : "+"}</text>
        </g>
        {leaves.map(({ lf, pos }) => renderLeaf(lf, pos, gPos, color, gVis))}
      </g>
    );
  };

  /* ── category node ── */
  const renderCat = (
    catData: ReturnType<typeof layout>[number]["cats"][number],
    brPos: { x: number; y: number }, brColor: string, brVisible: boolean,
  ) => {
    const { cat, cPos, skills, groups } = catData;
    const cVis  = brVisible && openCat.has(cat.id);
    const cShow = brVisible;
    return (
      <g key={cat.id}>
        {/* branch → cat line */}
        <path d={qBez(brPos.x, brPos.y, cPos.x, cPos.y)} fill="none" stroke={cat.color} strokeWidth="1" strokeLinecap="round"
          opacity={cShow ? 0.4 : 0} style={{ transition: "opacity 0.42s" }} />
        {/* flat skill lines + nodes */}
        {skills.map(({ sk, pos }) => renderLeaf(sk, pos, cPos, cat.color, cVis))}
        {/* sub-group lines + nodes */}
        {groups.map((g) => renderGrp(g, cPos, cat.color, cVis))}
        {/* category node (above children) */}
        <g style={{
          opacity: cShow ? 1 : 0,
          transform: `translate(${cShow ? cPos.x : brPos.x}px,${cShow ? cPos.y : brPos.y}px)`,
          transition: "opacity 0.42s ease, transform 0.52s cubic-bezier(0.34,1.4,0.64,1)",
          cursor: "pointer",
        }}
          onClick={(e) => tog(openCat, setOpenCat, cat.id, e)} role="button"
          aria-expanded={cVis} aria-label={`${cat.label} — ${cVis ? "collapse" : "expand"}`}>
          <circle r={cVis ? 56 : 48} fill={`url(#g-${cat.id})`} style={{ transition: "r 0.28s" }} />
          <rect x={-54} y={-25} width={108} height={50} rx={13}
            fill="rgba(8,8,8,0.90)" stroke={cVis ? cat.color : "rgba(255,255,255,0.13)"}
            strokeWidth={cVis ? 2 : 0.9} filter={cVis ? "url(#glow)" : undefined}
            style={{ transition: "stroke 0.28s, stroke-width 0.28s" }} />
          <text x={-33} y={0} fontSize={14} textAnchor="middle" dominantBaseline="middle">{cat.icon}</text>
          {lbl(cat.label, 12, 0, cVis ? cat.color : "#ededea", 9, true)}
          <text x={44} y={0} fontSize={10} fill={cat.color} textAnchor="middle" dominantBaseline="middle" opacity={0.88}>{cVis ? "−" : "+"}</text>
        </g>
      </g>
    );
  };

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div className="relative w-full select-none" aria-label="Skills Mind Map">

      {/* controls */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[["Expand All", expandAll], ["Collapse All", collapseAll], ["Reset View", resetView]].map(
            ([l, fn]) => (
              <button key={l as string} onClick={fn as () => void}
                className="rounded-full border border-line bg-white/5 px-4 py-1.5 font-body text-xs text-fog backdrop-blur-sm transition-colors hover:border-fog hover:text-paper">
                {l as string}
              </button>
            )
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={zoomOut} className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white/5 font-body text-sm text-fog transition-colors hover:border-fog hover:text-paper">−</button>
          <span className="w-12 text-center font-body text-xs text-fog">{Math.round(zoom * 100)}%</span>
          <button onClick={zoomIn}  className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white/5 font-body text-sm text-fog transition-colors hover:border-fog hover:text-paper">+</button>
        </div>
      </div>

      {!rootOpen && (
        <p className="mb-4 animate-pulse text-center font-body text-xs text-fog/60">
          Click the center node to begin · Drag to pan · Scroll to zoom
        </p>
      )}

      {/* canvas */}
      <div ref={containerRef}
        className="relative mx-auto w-full cursor-grab overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm active:cursor-grabbing"
        style={{ maxWidth: W, aspectRatio: `${W}/${H}` }}
        onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU} onPointerCancel={onPU}>

        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="h-full w-full"
          style={{ transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`, transformOrigin: "center", transition: dragging.current ? "none" : "transform 0.06s" }}>
          <defs>
            <radialGradient id="root-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={DATA.accent} stopOpacity="0.28" />
              <stop offset="100%" stopColor={DATA.accent} stopOpacity="0" />
            </radialGradient>
            {DATA.branches.map((b) => (
              <radialGradient key={b.id} id={`g-${b.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={b.color} stopOpacity="0.22" />
                <stop offset="100%" stopColor={b.color} stopOpacity="0" />
              </radialGradient>
            ))}
            {/* all category colors */}
            {DATA.branches.flatMap((b) => b.categories.map((c) => (
              <radialGradient key={c.id} id={`g-${c.id}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={c.color} stopOpacity="0.2" />
                <stop offset="100%" stopColor={c.color} stopOpacity="0" />
              </radialGradient>
            )))}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* ── root → branch lines ── */}
          {layout.map(({ branch, brPos }) => (
            <path key={`rl-${branch.id}`} d={qBez(CX, CY, brPos.x, brPos.y)}
              fill="none" stroke={branch.color} strokeWidth="1.6" strokeLinecap="round"
              opacity={rootOpen ? 0.48 : 0} style={{ transition: "opacity 0.5s ease" }} />
          ))}

          {/* ── BRANCHES + their trees ── */}
          {layout.map(({ branch, brPos, cats }) => {
            const brVis  = rootOpen;
            const brOpen = openBr.has(branch.id);
            return (
              <g key={branch.id}>
                {/* branch → category lines are handled inside renderCat */}
                {/* render categories */}
                {cats.map((catData) => renderCat(catData, brPos, branch.color, brOpen))}

                {/* BRANCH NODE */}
                <g style={{
                  opacity: brVis ? 1 : 0,
                  transform: `translate(${brVis ? brPos.x : CX}px,${brVis ? brPos.y : CY}px)`,
                  transition: "opacity 0.48s ease, transform 0.58s cubic-bezier(0.34,1.4,0.64,1)",
                  cursor: "pointer",
                }}
                  onClick={(e) => tog(openBr, setOpenBr, branch.id, e)}
                  role="button" aria-expanded={brOpen}
                  aria-label={`${branch.label} — ${brOpen ? "collapse" : "expand"}`}>
                  <circle r={brOpen ? 70 : 60} fill={`url(#g-${branch.id})`} style={{ transition: "r 0.3s" }} />
                  <rect x={-65} y={-30} width={130} height={60} rx={16}
                    fill="rgba(6,6,8,0.92)" stroke={brOpen ? branch.color : "rgba(255,255,255,0.16)"}
                    strokeWidth={brOpen ? 2.2 : 1} filter={brOpen ? "url(#glow)" : undefined}
                    style={{ transition: "stroke 0.3s, stroke-width 0.3s" }} />
                  <text x={-40} y={0} fontSize={18} textAnchor="middle" dominantBaseline="middle">{branch.icon}</text>
                  {lbl(branch.label, 18, 0, brOpen ? branch.color : "#ededea", 10.5, true)}
                  <text x={54} y={0} fontSize={11} fill={branch.color} textAnchor="middle" dominantBaseline="middle" opacity={0.88}>{brOpen ? "−" : "+"}</text>
                </g>
              </g>
            );
          })}

          {/* ── ROOT GLOW ── */}
          <circle cx={CX} cy={CY} r={110} fill="url(#root-grad)"
            opacity={rootOpen ? 1 : 0.45} style={{ transition: "opacity 0.5s" }} />

          {/* ── ROOT NODE ── */}
          <g onClick={toggleRoot} style={{ cursor: "pointer" }} role="button" aria-expanded={rootOpen}>
            <circle cx={CX} cy={CY} r={96} fill="none" stroke={DATA.accent} strokeWidth="1"
              opacity={rootOpen ? 0.5 : 0.22} style={{ transition: "opacity 0.4s" }} />
            <circle cx={CX} cy={CY} r={84} fill="rgba(6,6,8,0.97)" stroke={DATA.accent}
              strokeWidth={rootOpen ? 2.8 : 1.6} filter="url(#glow)"
              style={{ transition: "stroke-width 0.3s" }} />
            <text x={CX} y={CY - 16} fontSize={26} textAnchor="middle" dominantBaseline="middle">{DATA.icon}</text>
            <text x={CX} y={CY + 12} fontSize={14} fill={DATA.accent} textAnchor="middle" dominantBaseline="middle"
              fontFamily="var(--font-display)" fontStyle="italic" fontWeight="700">{DATA.label}</text>
            <circle cx={CX} cy={CY + 84 - 12} r={3.5} fill={DATA.accent}
              opacity={rootOpen ? 0 : 0.7} style={{ transition: "opacity 0.4s" }} />
          </g>
        </svg>

        {/* tooltip */}
        {tip && (
          <div className="pointer-events-none absolute z-20 max-w-[200px] rounded-xl border border-white/10 bg-ink/95 px-3 py-2 font-body text-xs leading-snug text-paper shadow-2xl backdrop-blur-md"
            style={{ left: tip.x, top: tip.y, transform: "translate(-50%,-100%)" }}>
            {tip.text}
          </div>
        )}
      </div>

      {/* ── MOBILE TREE ── */}
      <div className="mt-10 lg:hidden">
        <p className="mb-4 font-body text-xs text-fog/60">Tap to explore all skills</p>
        <MobileSkillTree />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MOBILE ACCORDION TREE
══════════════════════════════════════════════════════════════ */
function MobileSkillTree() {
  const [openBr,  setOpenBr]  = useState<Set<string>>(new Set());
  const [openCat, setOpenCat] = useState<Set<string>>(new Set());
  const [openGrp, setOpenGrp] = useState<Set<string>>(new Set());
  const tog = (set: Set<string>, setter: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) =>
    setter((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="flex flex-col gap-3">
      {DATA.branches.map((branch) => (
        <div key={branch.id} className="overflow-hidden rounded-xl border border-line"
          style={{ borderColor: openBr.has(branch.id) ? `${branch.color}55` : undefined }}>
          <button onClick={() => tog(openBr, setOpenBr, branch.id)}
            className="flex w-full items-center gap-3 px-4 py-4 text-left" aria-expanded={openBr.has(branch.id)}>
            <span className="text-2xl">{branch.icon}</span>
            <div className="flex-1">
              <div className="font-body text-sm font-bold text-paper">{branch.label.replace("\n", " ")}</div>
              <div className="font-body text-xs text-fog/50">{branch.categories.length} categories</div>
            </div>
            <span className="text-sm" style={{ color: branch.color }}>{openBr.has(branch.id) ? "−" : "+"}</span>
          </button>

          {openBr.has(branch.id) && (
            <div className="border-t border-white/5 px-4 pb-4 pt-2 flex flex-col gap-2">
              {branch.categories.map((cat) => (
                <div key={cat.id} className="overflow-hidden rounded-lg border border-white/8"
                  style={{ borderColor: openCat.has(cat.id) ? `${cat.color}44` : undefined }}>
                  <button onClick={() => tog(openCat, setOpenCat, cat.id)}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left">
                    <span>{cat.icon}</span>
                    <span className="flex-1 font-body text-xs font-semibold" style={{ color: openCat.has(cat.id) ? cat.color : "#ededea" }}>
                      {cat.label.replace("\n", " ")}
                    </span>
                    <span className="text-xs" style={{ color: cat.color }}>{openCat.has(cat.id) ? "−" : "+"}</span>
                  </button>
                  {openCat.has(cat.id) && (
                    <div className="border-t border-white/5 px-3 pb-3 pt-2">
                      {/* flat skills */}
                      {cat.skills && (
                        <div className="flex flex-wrap gap-1.5">
                          {cat.skills.map((sk) => (
                            <div key={sk.id} title={sk.tooltip}
                              className="flex items-center gap-1 rounded-lg border border-white/8 bg-white/[0.04] px-2.5 py-1">
                              <span className="text-xs" style={{ color: cat.color }}>{sk.icon}</span>
                              <span className="font-body text-[10px] text-fog">{sk.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* sub-groups */}
                      {cat.groups?.map((grp) => (
                        <div key={grp.id} className="mt-2">
                          <button onClick={() => tog(openGrp, setOpenGrp, grp.id)}
                            className="mb-1.5 flex items-center gap-1.5 font-body text-[10px] font-medium"
                            style={{ color: cat.color }}>
                            <span>{grp.icon}</span>{grp.label}
                            <span className="ml-1">{openGrp.has(grp.id) ? "−" : "+"}</span>
                          </button>
                          {openGrp.has(grp.id) && (
                            <div className="flex flex-wrap gap-1.5 pl-3">
                              {grp.children.map((lf) => (
                                <div key={lf.id} title={lf.tooltip}
                                  className="flex items-center gap-1 rounded-lg border border-white/8 bg-white/[0.04] px-2.5 py-1">
                                  <span className="text-xs" style={{ color: cat.color }}>{lf.icon}</span>
                                  <span className="font-body text-[10px] text-fog">{lf.label}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
