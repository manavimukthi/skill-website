import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg:      "rgb(var(--color-bg)      / <alpha-value>)",
        card:    "rgb(var(--color-card)    / <alpha-value>)",
        border:  "rgb(var(--color-border)  / <alpha-value>)",
        text:    "rgb(var(--color-text)    / <alpha-value>)",
        muted:   "rgb(var(--color-muted)   / <alpha-value>)",
        tagBg:   "rgb(var(--color-tagBg)   / <alpha-value>)",
        tagText: "rgb(var(--color-tagText) / <alpha-value>)",
        mustard: "#E8B84A",
        terra:   "#C8553D",
        accent:  "#E8B84A",
        accentDk:"#D4A53C",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        playfair:["var(--font-display)", "system-ui", "sans-serif"],
        dm:      ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono:    ["var(--font-share-tech-mono)", "monospace"],
      },
      boxShadow: {
        brutal:    "5px 5px 0 rgb(var(--color-text))",
        "brutal-sm":"3px 3px 0 rgb(var(--color-text))",
      },
    },
  },
  plugins: [],
};
export default config;
