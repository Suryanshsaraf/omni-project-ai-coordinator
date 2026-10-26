/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        night: {
          base: 'var(--night-base)',
          card: 'var(--night-card)',
          surface: 'var(--night-surface)',
          panel: 'var(--night-panel)',
          border: 'var(--night-border)',
          hover: 'var(--night-hover)'
        },
        ice: 'var(--ice)',
        plasma: {
          DEFAULT: '#B14BFF',
          glow: 'rgba(177, 75, 255, 0.45)'
        },
        signal: {
          amber: '#FFB224',
          green: '#2EE6A6',
          red: '#FF3B5C'
        }
      },
      fontFamily: {
        display: ['Unbounded', 'sans-serif'],
        sans: ['Instrument Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace']
      },
      animation: {
        'radar-sweep': 'radarSweep 4s linear infinite',
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'orb-float': 'orbFloat 8s ease-in-out infinite',
        'aurora-glow': 'auroraGlow 12s ease-in-out infinite alternate',
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' }
        },
        orbFloat: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-8px) scale(1.03)' }
        },
        auroraGlow: {
          '0%': { opacity: '0.4', filter: 'hue-rotate(0deg)' },
          '50%': { opacity: '0.65', filter: 'hue-rotate(15deg)' },
          '100%': { opacity: '0.4', filter: 'hue-rotate(-15deg)' }
        }
      }
    },
  },
  plugins: [],
}
