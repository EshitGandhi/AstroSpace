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
        // Celestial surface
        night:      "#23121C",
        "night-2":  "#3A1F33",
        gold:       "#E0B33C",

        // Both surfaces
        bhagva:     "#E8590C",
        primary:    "#E8590C", // alias for bhagva

        // Earthly surface
        cream:      "#FFF8F0",
        "cream-tint": "#FCE9DA",
        ink:        "#2E1410",
        "ink-muted":"#6B5046",

        // Utility
        white:      "#FFFFFF",
      },
      fontFamily: {
        sans:    ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-poppins)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
