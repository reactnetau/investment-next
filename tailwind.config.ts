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
        bg: "#f6f2ea",
        panel: "#fffdf8",
        ink: "#1e2a2f",
        muted: "#5f6b72",
        accent: "#0c6b58",
        "accent-2": "#d8a23d",
        danger: "#b44949",
        line: "#d9d0c3",
        good: "#1f7a46",
        bad: "#b43030",
      },
      fontFamily: {
        sans: [
          "Avenir Next",
          "Helvetica Neue",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
