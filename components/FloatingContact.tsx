"use client";

import { useState } from "react";

/* ── SVG icons (inline, no extra deps) ── */
const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <circle cx="9"  cy="10" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="10" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6"  y1="6" x2="18" y2="18" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15
      -.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475
      -.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52
      .149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207
      -.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372
      -.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2
      5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085
      1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.522 5.845L.057 23.526
      a.5.5 0 0 0 .609.61l5.79-1.507A11.943 11.943 0 0 0 12 24c6.627 0 12-5.373
      12-12S18.627 0 12 0zm0 21.818a9.794 9.794 0 0 1-4.964-1.35l-.356-.211
      -3.688.96.986-3.595-.232-.371A9.796 9.796 0 0 1 2.182 12C2.182 6.57
      6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
  </svg>
);

const GmailIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12
      16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457
      c0-2.023 2.309-3.178 3.927-1.964L12 9.64l8.073-6.147
      C21.69 2.28 24 3.434 24 5.457z"/>
  </svg>
);

export default function FloatingContact() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">

      {/* WhatsApp button */}
      <a
        href="https://wa.me/923047345029"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex items-center gap-2 overflow-hidden rounded-full font-body text-sm font-medium
                   shadow-lg transition-all duration-300 ease-out"
        style={{
          backgroundColor: "#25D366",
          color: "#fff",
          maxWidth: open ? "200px" : "0px",
          opacity: open ? 1 : 0,
          paddingLeft: open ? "14px" : "0px",
          paddingRight: open ? "16px" : "0px",
          paddingTop: "10px",
          paddingBottom: "10px",
          pointerEvents: open ? "auto" : "none",
          transform: open ? "translateY(0) scale(1)" : "translateY(12px) scale(0.85)",
          whiteSpace: "nowrap",
        }}
      >
        <WhatsAppIcon />
        <span>WhatsApp</span>
      </a>

      {/* Gmail button */}
      <a
        href="mailto:usama.developer.500@gmail.com"
        aria-label="Send an email via Gmail"
        className="flex items-center gap-2 overflow-hidden rounded-full font-body text-sm font-medium
                   shadow-lg transition-all duration-300 ease-out"
        style={{
          backgroundColor: "#EA4335",
          color: "#fff",
          maxWidth: open ? "200px" : "0px",
          opacity: open ? 1 : 0,
          paddingLeft: open ? "14px" : "0px",
          paddingRight: open ? "16px" : "0px",
          paddingTop: "10px",
          paddingBottom: "10px",
          pointerEvents: open ? "auto" : "none",
          transform: open ? "translateY(0) scale(1)" : "translateY(12px) scale(0.85)",
          transitionDelay: open ? "40ms" : "0ms",
          whiteSpace: "nowrap",
        }}
      >
        <GmailIcon />
        <span>Gmail</span>
      </a>

      {/* Main chat toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close contact options" : "Open contact options"}
        aria-expanded={open}
        className="flex h-14 w-14 items-center justify-center rounded-full shadow-2xl
                   transition-all duration-300 ease-out hover:scale-110 active:scale-95"
        style={{
          backgroundColor: "#c9a24b",
          color: "#0a0a0a",
          transform: open ? "rotate(0deg)" : "rotate(0deg)",
        }}
      >
        <span
          className="transition-all duration-300"
          style={{
            opacity: 1,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          {open ? <CloseIcon /> : <ChatIcon />}
        </span>
      </button>

      {/* Pulse ring when closed */}
      {!open && (
        <span
          className="pointer-events-none absolute bottom-0 right-0 h-14 w-14 animate-ping rounded-full opacity-30"
          style={{ backgroundColor: "#c9a24b" }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
