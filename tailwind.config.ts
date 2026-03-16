import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0d1117',
          'bg-secondary': '#161b22',
          'bg-tertiary': '#21262d',
          card: '#1c2128',
          'card-hover': '#252b33',
          border: '#30363d',
          'border-secondary': '#21262d',
        },
        text: {
          primary: '#e6edf3',
          secondary: '#8b949e',
          muted: '#6e7681',
        },
        priority: {
          high: {
            bg: '#3d1a1a',
            text: '#f87171',
            border: '#7f1d1d',
          },
          medium: {
            bg: '#3d2e0f',
            text: '#fbbf24',
            border: '#78350f',
          },
          low: {
            bg: '#132c1e',
            text: '#4ade80',
            border: '#14532d',
          },
        },
        type: {
          task: {
            bg: '#1e3a5f',
            text: '#60a5fa',
            border: '#1d4ed8',
          },
          discussion: {
            bg: '#3b1f5b',
            text: '#c084fc',
            border: '#7c3aed',
          },
          idea: {
            bg: '#3d3d0f',
            text: '#facc15',
            border: '#a16207',
          },
          bug: {
            bg: '#3d1a1a',
            text: '#f87171',
            border: '#dc2626',
          },
          backlog: {
            bg: '#1f2937',
            text: '#9ca3af',
            border: '#4b5563',
          },
        },
        creator: {
          julio: {
            bg: '#1e3a5f',
            text: '#60a5fa',
          },
          archie: {
            bg: '#3b1f5b',
            text: '#c084fc',
          },
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
        'card-drag': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.15)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
