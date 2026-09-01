import { ExternalLink } from "lucide-react";

interface Props {
  title: string;
  category: string;
  year: string;
  image: string;
  link: string;
}

export default function ProjectCard({ title, category, year, image, link }: Props) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block border-t border-line pt-4"
      aria-label={`View ${title} on GitHub`}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-line/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />

        {/* Hover overlay with GitHub icon */}
        <div className="absolute inset-0 flex items-center justify-center bg-ink/60 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex items-center gap-2 rounded-full border border-paper/30 bg-white/10 px-5 py-2.5 font-body text-sm text-paper backdrop-blur-md">
            <ExternalLink size={15} aria-hidden />
            View on GitHub
          </div>
        </div>
      </div>

      {/* Caption row */}
      <div className="mt-3 flex items-baseline justify-between font-body text-sm">
        <span className="text-paper">{title}</span>
        <span className="flex items-center gap-1.5 text-fog">
          {category} — {year}
          <ExternalLink
            size={11}
            className="opacity-0 transition-opacity group-hover:opacity-60"
            aria-hidden
          />
        </span>
      </div>
    </a>
  );
}
