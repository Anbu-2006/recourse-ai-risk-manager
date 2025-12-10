import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#000000",
        surface: "#080808",
        "surface-elevated": "#0e0e0e",
        "surface-card": "#131313",
        "primary-ink": "#ffffff",
        ink: "#ffffff",
        border: "rgba(255, 255, 255, 0.16)",
        "border-subtle": "rgba(255, 255, 255, 0.12)",
        "border-soft": "rgba(255, 255, 255, 0.12)",
        muted: "#9a9a9a",
        "text-muted": "#9a9a9a",
        stat: "#d8d8d8",

        accent: {
          DEFAULT: "#3B82F6",
          hover: "#2563EB",
          glow: "rgba(59, 130, 246, 0.35)",
        },
        pass: {
          DEFAULT: "#34D399",
          bg: "rgba(52, 211, 153, 0.1)",
          surface: "rgba(52, 211, 153, 0.1)",
          border: "rgba(52, 211, 153, 0.25)",
        },
        blocked: {
          DEFAULT: "#F87171",
          bg: "rgba(248, 113, 113, 0.1)",
          surface: "rgba(248, 113, 113, 0.1)",
          border: "rgba(248, 113, 113, 0.25)",
        },
        pending: {
          DEFAULT: "#FBBF24",
          bg: "rgba(251, 191, 36, 0.1)",
          surface: "rgba(251, 191, 36, 0.1)",
          border: "rgba(251, 191, 36, 0.25)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        serif: ["Instrument Serif", "Times New Roman", "Times", "serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      spacing: {
        "panel-left": "300px",
        "panel-right": "380px",
        "max-content": "1320px",
      },
      boxShadow: {
        card: "0 4px 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
        drawer: "-8px 0 40px rgba(0, 0, 0, 0.85), inset 1px 0 0 rgba(255, 255, 255, 0.12)",
        "glow-solid": "0 0 22px rgba(186, 208, 255, 0.35), 0 8px 18px rgba(255, 255, 255, 0.12)",
        "glow-pass": "0 0 18px rgba(52, 211, 153, 0.25)",
        "glow-blocked": "0 0 18px rgba(248, 113, 113, 0.25)",
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
