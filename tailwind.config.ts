import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0a", // near-black stage, not a flat #000
        paper: "#ededea", // warm-grey white for text, not pure #fff
        line: "#3a3a38", // hairline / border grey
        fog: "#7a7a76", // secondary text
        signal: "#c9a24b", // single muted brass accent, used sparingly
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
    },
  },
  plugins: [],
};

export default config;
