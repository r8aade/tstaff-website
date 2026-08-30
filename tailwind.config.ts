import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf3ee",
          100: "#f4ddce",
          200: "#e9bda0",
          300: "#dd9a70",
          400: "#d17b4c",
          500: "#c15b2b",
          600: "#a84a22",
          700: "#873a1c",
          800: "#6b2f18",
          900: "#552615",
          950: "#2e130a"
        },
        ink: {
          900: "#16150f",
          800: "#221f16",
          700: "#4a4739"
        },
        paper: {
          DEFAULT: "#faf8f4",
          dim: "#f0ece2"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Arial Black", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
