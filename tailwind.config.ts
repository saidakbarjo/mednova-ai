import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#050B1F",
          900: "#0A1633",
          800: "#0F1F45",
          700: "#16295A",
          600: "#1F3672",
        },
        brand: {
          50: "#ECFEFF",
          100: "#CFFAFE",
          200: "#A5F3FC",
          300: "#67E8F9",
          400: "#22D3EE",
          500: "#06B6D4",
          600: "#0891B2",
          700: "#0E7490",
        },
        ink: { DEFAULT: "#0B1530", soft: "#43506B", muted: "#7A869E" },
        line: "#E4E9F2",
        canvas: "#F6F8FC",
      },
      fontFamily: {
        sans: ["'Inter Variable'", "system-ui", "sans-serif"],
        display: ["'Plus Jakarta Sans Variable'", "'Inter Variable'", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,21,48,0.04), 0 4px 16px -4px rgba(11,21,48,0.06)",
        lift: "0 12px 32px -12px rgba(11,21,48,0.18)",
        glow: "0 0 0 1px rgba(34,211,238,0.25), 0 8px 30px -8px rgba(6,182,212,0.45)",
      },
      borderRadius: { xl2: "1.125rem" },
      keyframes: {
        pulseRing: { "0%": { transform: "scale(0.8)", opacity: "0.6" }, "100%": { transform: "scale(1.6)", opacity: "0" } },
        dash: { to: { strokeDashoffset: "0" } },
      },
      animation: {
        pulseRing: "pulseRing 2.4s cubic-bezier(0.2,0.6,0.3,1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
