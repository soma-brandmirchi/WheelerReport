import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0F1B1A",
          800: "#152625",
          700: "#1C302E",
          600: "#264240",
        },
        paper: "#EDEEF0",
        signal: {
          DEFAULT: "#F5A623",
          dim: "#B97C1B",
        },
        teal: {
          DEFAULT: "#1B6B65",
          light: "#2E948C",
        },
        slate: {
          line: "#5B6B79",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
