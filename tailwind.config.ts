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
        sans: ['Arial', 'Helvetica', 'sans-serif'],
        serif: ['Arial', 'Helvetica', 'sans-serif'],
        mono: ['Arial', 'Helvetica', 'sans-serif'],
        logo: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        solar: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        obsidian: {
          DEFAULT: '#090A0D',
          card: '#111318',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        cream: {
          DEFAULT: '#F7F6F2',
          card: '#FFFFFF',
          border: 'rgba(20, 20, 19, 0.08)',
        }
      },
      backgroundImage: {
        'solar-halo': 'radial-gradient(circle at 50% 45%, #F59E0B 0%, #D97706 35%, #92400E 65%, transparent 75%)',
        'subtle-halo': 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.18) 0%, rgba(217, 119, 6, 0.06) 45%, transparent 70%)',
      }
    },
  },
  plugins: [],
};
export default config;
