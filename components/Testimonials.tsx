"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  avatar: string; // initials
  color: string;  // avatar bg color
  rating: number;
  comment: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Ahmed Raza",
    role: "Product Manager",
    company: "TechVentures PK",
    avatar: "AR",
    color: "#c9a24b",
    rating: 5,
    comment:
      "Usama delivered our full-stack ecommerce platform ahead of schedule. His attention to detail and clean code structure made future iterations a breeze. Highly recommended for any serious web project.",
  },
  {
    name: "Sara Malik",
    role: "Startup Founder",
    company: "NovaBuild",
    avatar: "SM",
    color: "#7a5c8a",
    rating: 5,
    comment:
      "Working with Usama was an absolute pleasure. He understood our vision immediately and translated it into a beautiful, functional product. The React frontend he built is blazing fast.",
  },
  {
    name: "Bilal Khan",
    role: "Lead Developer",
    company: "CodeCraft Labs",
    avatar: "BK",
    color: "#4a7a6a",
    rating: 5,
    comment:
      "Excellent problem-solving skills and a deep understanding of modern JavaScript frameworks. Usama's Node.js backend work was solid, well-documented, and easy to maintain.",
  },
  {
    name: "Zara Hussain",
    role: "UI/UX Designer",
    company: "Pixel Studio",
    avatar: "ZH",
    color: "#8a4a4a",
    rating: 5,
    comment:
      "Usama turns designs into pixel-perfect reality. He collaborated closely with our design team and implemented every micro-interaction exactly as intended. A true professional.",
  },
  {
    name: "Omar Sheikh",
    role: "CTO",
    company: "DataFlow Systems",
    avatar: "OS",
    color: "#4a5a8a",
    rating: 5,
    comment:
      "The AI chatbot Usama built for our platform significantly improved customer engagement. His integration of machine learning with a clean UI was impressive. Will definitely hire again.",
  },
  {
    name: "Hina Baig",
    role: "E-Commerce Director",
    company: "StyleCart",
    avatar: "HB",
    color: "#6a7a4a",
    rating: 5,
    comment:
      "Our virtual try-on feature became our best-selling point after Usama rebuilt it. The performance improvements and mobile responsiveness he delivered exceeded all expectations.",
  },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill={i < rating ? "#c9a24b" : "none"}
          stroke={i < rating ? "#c9a24b" : "#3a3a38"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 340;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section
      id="testimonials"
      className="border-t border-line py-24 md:py-32"
      aria-label="Client testimonials"
    >
      {/* Header */}
      <div className="mb-12 flex items-end justify-between border-b border-line pb-8 px-8 md:px-16">
        <div>
          <p className="mb-1 font-body text-[10px] uppercase tracking-widest text-signal">
            Kind Words
          </p>
          <h2 className="font-display text-3xl italic text-paper md:text-4xl">
            Client feedback
          </h2>
        </div>

        {/* Arrow controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-fog transition-colors hover:border-paper hover:text-paper"
          >
            <ChevronLeft size={16} aria-hidden />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-fog transition-colors hover:border-paper hover:text-paper"
          >
            <ChevronRight size={16} aria-hidden />
          </button>
        </div>
      </div>

      {/* Horizontal scroll track */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto scroll-smooth px-8 pb-4 md:px-16"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {TESTIMONIALS.map((t) => (
          <article
            key={t.name}
            className="group flex w-[300px] flex-none flex-col justify-between rounded-2xl border border-line bg-ink p-6 transition-colors duration-300 hover:border-fog md:w-[340px]"
          >
            {/* Stars */}
            <div className="mb-4">
              <StarRow rating={t.rating} />
            </div>

            {/* Comment */}
            <p className="mb-6 font-body text-sm leading-relaxed text-fog">
              &ldquo;{t.comment}&rdquo;
            </p>

            {/* Profile */}
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className="flex h-10 w-10 flex-none items-center justify-center rounded-full font-body text-xs font-semibold text-ink"
                style={{ backgroundColor: t.color }}
                aria-hidden="true"
              >
                {t.avatar}
              </div>

              <div className="min-w-0">
                <p className="truncate font-body text-sm text-paper">{t.name}</p>
                <p className="truncate font-body text-xs text-fog">
                  {t.role} · {t.company}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Hide scrollbar in WebKit */}
      <style>{`
        #testimonials div::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
