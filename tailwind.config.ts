import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        magenta: {
          DEFAULT: "#E20074",
          50: "#FFE6F3",
          100: "#FFCCE7",
          200: "#FF99CF",
          300: "#FF66B7",
          400: "#FF1A8C",
          500: "#E20074",
          600: "#B5005D",
          700: "#880046",
          800: "#5A002F",
          900: "#2D0017",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        aurora: "aurora 60s linear infinite",
        "float-a": "floatA 6s ease-in-out infinite",
        "float-b": "floatB 4.5s ease-in-out infinite",
        "float-c": "floatC 5.5s ease-in-out infinite 0.8s",
        "grow-line": "growLine 0.8s cubic-bezier(.22,1,.36,1) 1.4s forwards",
      },
      keyframes: {
        aurora: {
          from: { backgroundPosition: "50% 50%, 50% 50%" },
          to: { backgroundPosition: "350% 50%, 350% 50%" },
        },
        floatA: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        floatB: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        floatC: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(8px)" },
        },
        growLine: {
          to: { width: "100%" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
