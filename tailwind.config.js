/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(0, 248, 185)',
        'primary-hover': 'rgb(0, 218, 165)',
        background: {
          start: 'rgba(40, 39, 52, 0.95)',
          end: 'rgba(14, 14, 20, 0.95)',
        },
        success: {
          light: '#4ade80',
          DEFAULT: '#22c55e',
          dark: '#16a34a',
        },
        warning: {
          light: '#fcd34d',
          DEFAULT: '#f59e0b',
          dark: '#d97706',
        },
        error: {
          light: '#f87171',
          DEFAULT: '#ef4444',
          dark: '#dc2626',
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { filter: 'drop-shadow(0 0 4px rgba(0, 248, 185, 0.6))' },
          '50%': { filter: 'drop-shadow(0 0 8px rgba(0, 248, 185, 0.8))' },
        },
      },
    },
  },
  plugins: [],
};