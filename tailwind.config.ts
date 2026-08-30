import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#b3ccff",
          300: "#80a8ff",
          400: "#4d7fff",
          500: "#2657f5",
          600: "#1a41cc",
          700: "#1633a3",
          800: "#152c80",
          900: "#152863",
          950: "#0c1638"
        },
        ink: {
          900: "#0b1220",
          800: "#111a2e",
          700: "#1b2740"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
