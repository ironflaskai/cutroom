/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: 'oklch(0.13 0.018 48)',
          900: 'oklch(0.17 0.02 48)',
          850: 'oklch(0.21 0.02 48)',
          800: 'oklch(0.26 0.018 48)',
          700: 'oklch(0.34 0.016 48)',
          600: 'oklch(0.46 0.014 48)',
          400: 'oklch(0.7 0.012 55)',
          300: 'oklch(0.8 0.01 55)',
          200: 'oklch(0.88 0.008 55)',
          100: 'oklch(0.95 0.006 55)'
        },
        accent: {
          DEFAULT: 'oklch(0.78 0.145 55)',
          dim: 'oklch(0.58 0.11 55)',
          soft: 'oklch(0.78 0.145 55 / 0.16)',
          glow: 'oklch(0.78 0.145 55 / 0.38)'
        },
        warn: {
          DEFAULT: 'oklch(0.82 0.13 85)',
          soft: 'oklch(0.82 0.13 85 / 0.15)'
        },
        danger: {
          DEFAULT: 'oklch(0.68 0.17 28)',
          soft: 'oklch(0.68 0.17 28 / 0.15)'
        },
        ok: {
          DEFAULT: 'oklch(0.74 0.13 145)',
          soft: 'oklch(0.74 0.13 145 / 0.15)'
        }
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'Consolas', 'monospace']
      },
      boxShadow: {
        panel: '0 0 0 1px oklch(1 0 0 / 0.05), 0 14px 42px oklch(0 0 0 / 0.42)',
        inset: 'inset 0 1px 0 oklch(1 0 0 / 0.04)'
      },
      transitionTimingFunction: {
        outExpo: 'cubic-bezier(0.16, 1, 0.3, 1)'
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.55', transform: 'scale(0.85)' }
        },
        streamGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 oklch(0.78 0.145 55 / 0)' },
          '50%': { boxShadow: '0 0 26px 0 oklch(0.78 0.145 55 / 0.22)' }
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        pulseDot: 'pulseDot 1.6s ease-in-out infinite',
        streamGlow: 'streamGlow 2.4s ease-in-out infinite',
        fadeUp: 'fadeUp 280ms cubic-bezier(0.16, 1, 0.3, 1) both'
      }
    }
  },
  plugins: []
}
