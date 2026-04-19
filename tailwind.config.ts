import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0d0a08", // Deep warm cosmic/dark brown
        foreground: "#fcf9f2",
        accent: {
          pink: "#ff8c00",   // Shifted to dark orange
          blue: "#ffd700",   // Shifted to bright gold
          gold: "#e6a147",   // Warm muted gold
          purple: "#d35400"  // Deep terracotta
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-outfit)", "sans-serif"],
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(135deg, #0d0a08 0%, #2a1200 50%, #0d0a08 100%)',
      }
    },
  },
  plugins: [],
};
export default config;
