"use client";

import { useState, useEffect } from "react";
import {
  Code2,
  GraduationCap,
  FolderKanban,
  Rocket,
  Share2,
  Mail,
  Menu,
  X,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Skills",          href: "#skills",          Icon: Code2 },
  { label: "Education",       href: "#education",       Icon: GraduationCap },
  { label: "Projects",        href: "#projects",        Icon: FolderKanban },
  { label: "Current Project", href: "#current-project", Icon: Rocket },
  { label: "Social Media",    href: "#social",          Icon: Share2 },
  { label: "Contact Us",      href: "#contact",         Icon: Mail },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* Add a subtle backdrop once user scrolls */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close drawer when a link is clicked */
  const handleNavClick = () => setOpen(false);

  return (
    <>
      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500
          border-b border-white/10
          bg-white/5 backdrop-blur-xl backdrop-saturate-150
          shadow-[0_4px_32px_rgba(0,0,0,0.4)]
          ${scrolled ? "bg-white/10 shadow-[0_4px_40px_rgba(0,0,0,0.6)]" : ""}
        `}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-10">
          {/* Logo */}
          <a
            href="#"
            className="group flex items-center gap-3 transition-opacity hover:opacity-70"
          >
            <img
              src="/frames/frame_0041.webp"
              alt="Usama Bhatti"
              className="h-9 w-9 rounded-full object-cover ring-1 ring-white/20 transition-all duration-300 group-hover:ring-2 group-hover:ring-signal"
            />
            <span className="font-display text-xl italic text-paper">Usama Bhatti</span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                className="group flex items-center gap-1.5 rounded-md px-3 py-2 font-body text-sm text-fog transition-colors hover:bg-line/40 hover:text-paper"
              >
                <Icon
                  size={14}
                  className="shrink-0 text-signal opacity-70 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
                {label}
              </a>
            ))}
          </nav>

          {/* Mobile burger */}
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-fog transition-colors hover:bg-line/40 hover:text-paper lg:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ──────────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden
        />

        {/* Panel */}
        <nav
          className={`absolute right-0 top-0 flex h-full w-72 flex-col gap-1
            border-l border-white/10
            bg-white/5 backdrop-blur-2xl backdrop-saturate-150
            shadow-[-8px_0_40px_rgba(0,0,0,0.5)]
            px-6 pt-20 pb-8 transition-transform duration-300
            ${open ? "translate-x-0" : "translate-x-full"}
          `}
        >
          {NAV_LINKS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              onClick={handleNavClick}
              className="group flex items-center gap-3 rounded-md px-4 py-3 font-body text-sm text-fog transition-colors hover:bg-line/40 hover:text-paper"
            >
              <Icon
                size={16}
                className="shrink-0 text-signal opacity-70 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
              {label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}
