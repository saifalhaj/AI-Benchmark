import type { Config } from "tailwindcss";

// Design tokens — locked. Dark-only "instrument panel" theme.
// One brand accent (azure). Trust semantics are the ONLY other colored hues:
//   warn (amber)   -> saturated / scaffold-dependent
//   danger (rose)  -> contaminated
//   ok (emerald)   -> independent / contamination-resistant / verified
// Shape scale: cards 8px (rounded-lg), controls 6px (rounded-md), chips 4px (rounded).
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0b0e",
        surface: "#111318",
        elevated: "#171a20",
        line: "#22262e",
        "line-strong": "#333945",
        fg: "#e7e9ee",
        muted: "#9aa2ad",
        faint: "#7b828d",
        accent: {
          DEFAULT: "#5b9bff",
          dim: "#3d6fd1",
          soft: "#16233d",
        },
        warn: { DEFAULT: "#e0a63c", soft: "#2c2413" },
        danger: { DEFAULT: "#e5654b", soft: "#2e1a16" },
        ok: { DEFAULT: "#3fb27f", soft: "#132720" },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      maxWidth: {
        grid: "1400px",
      },
    },
  },
  plugins: [],
};

export default config;
