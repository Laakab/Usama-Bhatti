"use client";

import { useCallback, useState } from "react";
import Preloader from "@/components/Preloader";
import ScrollFrameCanvas from "@/components/ScrollFrameCanvas";
import FrameText from "@/components/FrameText";
import ProjectCard from "@/components/ProjectCard";
import MagneticButton from "@/components/Buttons";
import Header from "@/components/Header";
import MasterSkillsMindMap from "@/components/MasterSkillsMindMap";
import Testimonials from "@/components/Testimonials";
import ContactForm from "@/components/ContactForm";
import { FRAME_COUNT } from "@/lib/frames";
import {
  Code2,
  GraduationCap,
  Rocket,
  Bot,
  Link,
  Globe,
  MessageCircle,
  Camera,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

/* ─────────────────────────── data ─────────────────────────── */

const PROJECTS = [
  {
    title: "MERN Ecommerce",
    category: "Full Stack",
    year: "2024",
    image: "/Projects Image/1.jfif",
    link: "https://github.com/Laakab/MERN-ECOMMERCE",
    rating: 5,
  },
  {
    title: "Professional Ecommerce",
    category: "Web App",
    year: "2024",
    image: "/Projects Image/2.jfif",
    link: "https://github.com/Laakab/Professional-Ecommerce-Website",
    rating: 4,
  },
  {
    title: "HTML CSS MSSQL AI ChatBot",
    category: "AI / Chat",
    year: "2023",
    image: "/Projects Image/3.jfif",
    link: "https://github.com/Laakab/HTML-CSS-MSSQl-Ai-ChatBot",
    rating: 4,
  },
  {
    title: "PHP MySQL",
    category: "Back End",
    year: "2023",
    image: "/Projects Image/4.jfif",
    link: "https://github.com/Laakab/PHP-MySQL",
    rating: 3,
  },
  {
    title: "Virtual Try-On",
    category: "AI / Vision",
    year: "2024",
    image: "/Projects Image/5.jfif",
    link: "https://github.com/Laakab/Virtual-Try-On",
    rating: 5,
  },
];

const EDUCATION = [
  {
    type: "degree",
    degree: "Bachelor of Science in Computer Science (BSCS)",
    school: "Superior University",
    location: "Lahore, Pakistan",
    year: "2023 – 2027",
    description: "Pursuing a full degree in Computer Science with focus on software engineering, data structures, and modern web technologies.",
  },
  {
    type: "degree",
    degree: "Intermediate — ICS (Computer Science)",
    school: "Superior College",
    location: "Lahore, Pakistan",
    year: "2019 – 2021",
    description: "Studied Computer Science, Mathematics, and Physics at intermediate level.",
  },
  {
    type: "degree",
    degree: "Matriculation — Biology",
    school: "SM Grammar High School",
    location: "Lahore, Pakistan",
    year: "2017 – 2019",
    description: "Completed matriculation with Biology as major subject.",
  },
  {
    type: "course",
    degree: "Full Stack Web Developer",
    school: "PNY Arfa Tower",
    location: "Lahore, Pakistan",
    year: "2021 – 2022",
    description: "Professional certification course covering front-end and back-end web development technologies.",
  },
];

const SOCIAL = [
  { label: "GitHub",    href: "https://github.com",    Icon: Link },
  { label: "LinkedIn",  href: "https://linkedin.com",  Icon: Globe },
  { label: "Twitter",   href: "https://twitter.com",   Icon: MessageCircle },
  { label: "Instagram", href: "https://instagram.com", Icon: Camera },
];

/* ─────────────────────────── page ─────────────────────────── */

export default function Home() {
  const [images, setImages] = useState<HTMLImageElement[] | null>(null);
  const [frame, setFrame] = useState(0);

  const handleLoaded = useCallback((imgs: HTMLImageElement[]) => setImages(imgs), []);

  return (
    <>
      {!images && <Preloader onLoaded={handleLoaded} />}

      {/* ── Sticky navigation header ── */}
      <Header />

      {/* ── Scroll-based canvas hero ── */}
      {images && (
        <div className="relative">
          <ScrollFrameCanvas images={images} scrollLengthVh={400} onFrameChange={setFrame} />
          <div
            className="pointer-events-none fixed inset-0 z-20 transition-opacity duration-500"
            style={{ opacity: frame >= FRAME_COUNT - 1 ? 0 : 1 }}
          >
            <FrameText frame={frame} />
          </div>
        </div>
      )}

      {/* ══════════════════ MAIN CONTENT ══════════════════ */}
      <main className="relative z-10 bg-ink">

        {/* ── Skills Mind Map (unified) ─────────────────── */}
        <section id="skills" className="px-8 py-24 md:px-16 md:py-32">
          <SectionHeading icon={<Code2 size={20} className="text-signal" />} label="Skills" />
          <div className="mt-12">
            <MasterSkillsMindMap />
          </div>
        </section>

        {/* ── Education ────────────────────────────────── */}
        <section id="education" className="border-t border-line px-8 py-24 md:px-16 md:py-32">          <SectionHeading icon={<GraduationCap size={20} className="text-signal" />} label="Education" />

          <div className="mt-12 flex flex-col gap-6">
            {EDUCATION.map((edu) => (
              <div key={edu.degree} className="group rounded-xl border border-line p-8 transition-colors hover:border-fog">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    {edu.type === "course" ? (
                      <span className="rounded-full border border-signal/40 bg-signal/10 px-2.5 py-0.5 font-body text-xs text-signal">
                        Professional Course
                      </span>
                    ) : (
                      <span className="rounded-full border border-line bg-line/30 px-2.5 py-0.5 font-body text-xs text-fog">
                        🎓 Degree
                      </span>
                    )}
                  </div>
                  <span className="rounded-full border border-line px-3 py-1 font-body text-xs text-fog">
                    {edu.year}
                  </span>
                </div>
                <h3 className="mb-1 font-display text-xl italic text-paper">{edu.degree}</h3>
                <p className="mb-0.5 font-body text-sm text-signal">{edu.school}</p>
                <p className="mb-3 flex items-center gap-1 font-body text-xs text-fog">
                  <MapPin size={11} aria-hidden /> {edu.location}
                </p>
                <p className="font-body text-sm leading-relaxed text-fog">{edu.description}</p>
              </div>
            ))}
          </div>

          {/* Location tag */}
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-body text-xs text-fog">
            <MapPin size={12} className="text-signal" aria-hidden />
            Lahore, Punjab, Pakistan
          </div>
        </section>

        {/* ── Projects ─────────────────────────────────── */}
        <section id="projects" className="border-t border-line px-8 py-24 md:px-16 md:py-32">
          <div className="mb-16 flex items-end justify-between border-b border-line pb-8">
            <h2 className="font-display text-3xl italic text-paper md:text-4xl">Selected work</h2>
            <span className="font-body text-sm text-fog">05 projects</span>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-5">
            {PROJECTS.map((p) => (
              <ProjectCard key={p.title} {...p} />
            ))}
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────── */}
        <Testimonials />

        {/* ── Current Project ──────────────────────────── */}
        <section id="current-project" className="border-t border-line px-8 py-24 md:px-16 md:py-32">
          <SectionHeading icon={<Rocket size={20} className="text-signal" />} label="Current Project" />

          <div className="mt-12 rounded-2xl border border-signal/30 bg-signal/5 p-8 md:p-12">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-signal/40 px-4 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-signal" />
              <span className="font-body text-xs text-signal">In Progress</span>
            </div>
            <h3 className="mb-4 font-display text-2xl italic text-paper md:text-3xl">
              AI-Powered Portfolio Platform
            </h3>
            <p className="mb-8 max-w-2xl font-body text-sm leading-relaxed text-fog">
              Building a next-generation portfolio experience that combines scroll-driven
              animations with AI-generated content summaries. The platform leverages WebGL
              for frame-accurate video playback, GSAP for micro-interactions, and a custom
              headless CMS to keep content fresh without code deploys.
            </p>
            <div className="flex flex-wrap gap-3">
              {["Next.js 14", "GSAP", "WebGL", "OpenAI API", "Vercel"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-line px-3 py-1 font-body text-xs text-fog"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Social Media ─────────────────────────────── */}
        <section id="social" className="border-t border-line px-8 py-24 md:px-16 md:py-32">
          <SectionHeading icon={<span className="text-signal text-base">↗</span>} label="Social Media" />

          <div className="mt-12 flex flex-wrap gap-4">
            {SOCIAL.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-line px-6 py-4 font-body text-sm text-fog transition-all hover:border-paper hover:text-paper"
              >
                <Icon
                  size={18}
                  className="text-signal opacity-70 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
                {label}
              </a>
            ))}
          </div>
        </section>

        {/* ── Contact ──────────────────────────────────── */}
        <section id="contact" className="border-t border-line px-8 py-24 md:px-16 md:py-32">
          <SectionHeading icon={<Mail size={20} className="text-signal" />} label="Contact Us" />

          <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
            {/* Info */}
            <div className="flex flex-col gap-6">
              <p className="max-w-md font-display text-2xl italic text-paper md:text-3xl">
                Available for portrait and editorial commissions.
              </p>
              <ul className="flex flex-col gap-4">
                <ContactItem icon={<Mail size={16} />}     text="usama.developer.500@gmail.com" />
                <ContactItem icon={<Phone size={16} />}    text="+92 304 7345026" />
                <ContactItem icon={<MapPin size={16} />}   text="Lahore, Pakistan" />
              </ul>
              <MagneticButton href="mailto:usama.developer.500@gmail.com">Start a project</MagneticButton>
            </div>

            {/* Form */}
            <ContactForm />
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────── */}
        <footer className="border-t border-line px-8 py-6 md:px-16">
          <div className="flex items-center justify-between font-body text-xs text-fog">
            <span>&copy; {new Date().getFullYear()} Vision</span>
            <span>Lahore</span>
          </div>
        </footer>
      </main>
    </>
  );
}

/* ─────────────────────────── helpers ─────────────────────────── */

function SectionHeading({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-line pb-6">
      {icon}
      <h2 className="font-display text-3xl italic text-paper md:text-4xl">{label}</h2>
    </div>
  );
}

function ContactItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-center gap-3 font-body text-sm text-fog">
      <span className="text-signal">{icon}</span>
      {text}
    </li>
  );
}

function FormField({
  id,
  label,
  type,
  placeholder,
}: {
  id: string;
  label: string;
  type: string;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-body text-xs text-fog">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-lg border border-line bg-transparent px-4 py-3 font-body text-sm text-paper placeholder:text-fog/50 focus:border-fog focus:outline-none"
      />
    </div>
  );
}
