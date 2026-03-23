import type { Config } from "tailwindcss";

/**
 * Configuration Tailwind CSS 4
 * Note : Tailwind v4 utilise principalement CSS-first config via @import "tailwindcss"
 * Ce fichier est conservé pour les extensions de thème et la compatibilité outillage
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
