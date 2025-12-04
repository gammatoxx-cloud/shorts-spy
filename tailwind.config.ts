import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-manrope)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['var(--font-sora)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'dark-bg': '#0a0a0f',
        'dark-card': 'rgba(15, 15, 25, 0.6)',
        'blue-glow': '#3b82f6',
        'blue-accent': '#2563eb',
      },
      boxShadow: {
        'glow': '0 0 10px rgba(59, 130, 246, 0.3)',
        'glow-lg': '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-xl': '0 0 30px rgba(59, 130, 246, 0.5)',
        'glow-inset': 'inset 0 0 20px rgba(59, 130, 246, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
export default config;

